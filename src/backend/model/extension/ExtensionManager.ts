import {ProjectPath} from '../../ProjectPath';
import {Config} from '../../../common/config/private/Config';
import * as fs from 'fs';
import * as path from 'path';
import {IObjectManager} from '../database/IObjectManager';
import {Logger} from '../../Logger';
import {IExtensionEvents, IExtensionObject, IServerExtension} from './IExtension';
import {ObjectManagers} from '../ObjectManagers';
import {Server} from '../../server';
import {ExtensionEvent} from './ExtensionEvent';

const LOG_TAG = '[ExtensionManager]';

export class ExtensionManager implements IObjectManager {

  events: IExtensionEvents = {
    gallery: {
      MetadataLoader: {
        loadPhotoMetadata: new ExtensionEvent()
      }
    }
  };

  public async init() {
    this.loadExtensionsList();
    await this.initExtensions();
  }

  public loadExtensionsList() {
    if (!fs.existsSync(ProjectPath.ExtensionFolder)) {
      return;
    }
    Config.Extensions.list = fs
      .readdirSync(ProjectPath.ExtensionFolder)
      .filter((f): boolean =>
        fs.statSync(path.join(ProjectPath.ExtensionFolder, f)).isDirectory()
      );
    Config.Extensions.list.sort();
  }

  private async callServerFN(fn: (ext: IServerExtension, extName: string) => Promise<void>) {
    for (let i = 0; i < Config.Extensions.list.length; ++i) {
      const extName = Config.Extensions.list[i];
      const extPath = path.join(ProjectPath.ExtensionFolder, extName);
      const serverExt = path.join(extPath, 'server.js');
      if (!fs.existsSync(serverExt)) {
        continue;
      }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ext = require(serverExt);
      await fn(ext, extName);
    }
  }

  private createExtensionObject(): IExtensionObject {
    return {
      app: {
        objectManagers: ObjectManagers.getInstance(),
        config: Config,
        paths: ProjectPath,
        expressApp: Server.getInstance().app
      },
      events: null
    };
  }

  private async initExtensions() {
    await this.callServerFN(async (ext, extName) => {
      if (typeof ext?.init === 'function') {
        Logger.debug(LOG_TAG, 'Running Init on extension:' + extName);
        await ext?.init(this.createExtensionObject());
      }
    });
  }

  private async cleanUpExtensions() {
    await this.callServerFN(async (ext, extName) => {
      if (typeof ext?.cleanUp === 'function') {
        Logger.debug(LOG_TAG, 'Running Init on extension:' + extName);
        await ext?.cleanUp();
      }
    });
  }


  public async cleanUp() {
    await this.cleanUpExtensions();
  }
}
