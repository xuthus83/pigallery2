import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import * as fs from 'fs';
import * as path from 'path';
import {IObjectManager} from '../database/IObjectManager';
import {createLoggerWrapper, Logger} from '../../Logger';
import {IExtensionEvents, IExtensionObject, IServerExtension} from './IExtension';
import {Server} from '../../server';
import {ExtensionEvent} from './ExtensionEvent';
import {ExpressRouterWrapper} from './ExpressRouterWrapper';
import * as express from 'express';
import {ExtensionApp} from './ExtensionApp';
import {ExtensionDB} from './ExtensionDB';
import {SQLConnection} from '../database/SQLConnection';

const LOG_TAG = '[ExtensionManager]';

export class ExtensionManager implements IObjectManager {

  public static EXTENSION_API_PATH = Config.Server.apiPath + '/extension';

  events: IExtensionEvents;
  extObjects: { [key: string]: IExtensionObject } = {};
  router: express.Router;

  constructor() {
    this.initEvents();
  }

  public async init() {
    this.extObjects = {};
    this.initEvents();
    this.router = express.Router();
    Server.getInstance().app.use(ExtensionManager.EXTENSION_API_PATH, this.router);
    this.loadExtensionsList();
    await this.initExtensions();
  }

  private initEvents() {
    this.events = {
      gallery: {
        MetadataLoader: {
          loadPhotoMetadata: new ExtensionEvent(),
          loadVideoMetadata: new ExtensionEvent()
        },
        CoverManager: {
          getCoverForDirectory: new ExtensionEvent(),
          getCoverForAlbum: new ExtensionEvent(),
          invalidateDirectoryCovers: new ExtensionEvent(),
        },
        DiskManager: {
          scanDirectory: new ExtensionEvent()
        },
        ImageRenderer: {
          render: new ExtensionEvent()
        }
      }
    };
  }

  public loadExtensionsList() {
    Logger.debug(LOG_TAG, 'Loading extension list from ' + ProjectPath.ExtensionFolder);
    if (!fs.existsSync(ProjectPath.ExtensionFolder)) {
      return;
    }

    Config.Extensions.list = fs
      .readdirSync(ProjectPath.ExtensionFolder)
      .filter((f): boolean =>
        fs.statSync(path.join(ProjectPath.ExtensionFolder, f)).isDirectory()
      );
    Config.Extensions.list.sort();
    Logger.debug(LOG_TAG, 'Extensions found ', JSON.stringify(Config.Extensions.list));
  }

  private async callServerFN(fn: (ext: IServerExtension, extName: string) => Promise<void>) {
    for (let i = 0; i < Config.Extensions.list.length; ++i) {
      const extName = Config.Extensions.list[i];
      const extPath = path.join(ProjectPath.ExtensionFolder, extName);
      const serverExt = path.join(extPath, 'server.js');
      if (!fs.existsSync(serverExt)) {
        Logger.silly(LOG_TAG, `Skipping ${extName} server initiation. server.js does not exists`);
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ext = require(serverExt);
      await fn(ext, extName);
    }
  }

  private createExtensionObject(name: string): IExtensionObject {
    if (!this.extObjects[name]) {
      const logger = createLoggerWrapper(`[Extension][${name}]`);
      this.extObjects[name] = {
        _app: new ExtensionApp(),
        db: new ExtensionDB(logger),
        paths: ProjectPath,
        Logger: logger,
        events: this.events,
        RESTApi: new ExpressRouterWrapper(this.router, name, logger)
      };
    }
    return this.extObjects[name];
  }

  private async initExtensions() {
    await this.callServerFN(async (ext, extName) => {
      if (typeof ext?.init === 'function') {
        Logger.debug(LOG_TAG, 'Running init on extension: ' + extName);
        await ext?.init(this.createExtensionObject(extName));
      }
    });
    if (Config.Extensions.cleanUpUnusedTables) {
      // Clean up tables after all Extension was initialized.
      await SQLConnection.removeUnusedTables();
    }
  }

  private async cleanUpExtensions() {
    await this.callServerFN(async (ext, extName) => {
      if (typeof ext?.cleanUp === 'function') {
        Logger.debug(LOG_TAG, 'Running Init on extension:' + extName);
        await ext?.cleanUp(this.createExtensionObject(extName));
      }
    });
  }


  public async cleanUp() {
    this.initEvents(); // reset events
    await this.cleanUpExtensions();
    Server.getInstance().app.use(ExtensionManager.EXTENSION_API_PATH, express.Router());
    this.extObjects = {};
  }
}
