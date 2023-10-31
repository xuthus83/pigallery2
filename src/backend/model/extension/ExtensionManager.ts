import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import * as fs from 'fs';
import * as path from 'path';
import {IObjectManager} from '../database/IObjectManager';
import {createLoggerWrapper, Logger} from '../../Logger';
import {IExtensionEvents, IExtensionObject, IServerExtension} from './IExtension';
import {ObjectManagers} from '../ObjectManagers';
import {Server} from '../../server';
import {ExtensionEvent} from './ExtensionEvent';

const LOG_TAG = '[ExtensionManager]';

export class ExtensionManager implements IObjectManager {

  events: IExtensionEvents = {
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

  public async init() {
    this.loadExtensionsList();
    await this.initExtensions();
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
    return {
      _app: {
        objectManagers: ObjectManagers.getInstance(),
        expressApp: Server.getInstance().app,
        config: Config
      },
      paths: ProjectPath,
      Logger: createLoggerWrapper(`[Extension: ${name}]`),
      events: this.events
    };
  }

  private async initExtensions() {
    await this.callServerFN(async (ext, extName) => {
      if (typeof ext?.init === 'function') {
        Logger.debug(LOG_TAG, 'Running init on extension: ' + extName);
        await ext?.init(this.createExtensionObject(extName));
      }
    });
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
    await this.cleanUpExtensions();
  }
}
