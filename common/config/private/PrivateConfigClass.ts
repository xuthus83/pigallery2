import {PublicConfigClass} from '../public/ConfigClass';
import {IPrivateConfig, ServerConfig,} from './IPrivateConfig';
import * as path from 'path';
import {ConfigLoader} from 'typeconfig';
import {Utils} from '../../Utils';
import {UserRoles} from '../../entities/UserDTO';
import {TaskTriggerType} from '../../entities/task/TaskScheduleDTO';
import {DefaultsTasks} from '../../entities/task/TaskDTO';

/**
 * This configuration will be only at backend
 */
export class PrivateConfigClass extends PublicConfigClass implements IPrivateConfig {

  public Server: ServerConfig.Config = {
    port: 80,
    host: '0.0.0.0',
    imagesFolder: 'demo/images',
    Thumbnail: {
      folder: 'demo/TEMP',
      processingLibrary: ServerConfig.ThumbnailProcessingLib.sharp,
      qualityPriority: true,
      personFaceMargin: 0.6
    },
    Log: {
      level: ServerConfig.LogLevel.info,
      sqlLevel: ServerConfig.SQLLogLevel.error
    },
    sessionTimeout: 1000 * 60 * 60 * 24 * 7,
    photoMetadataSize: 512 * 1024,
    Database: {
      type: ServerConfig.DatabaseType.sqlite,
      mysql: {
        host: '',
        username: '',
        password: '',
        database: ''

      },
      sqlite: {
        storage: 'sqlite.db'
      }
    },
    Sharing: {
      updateTimeout: 1000 * 60 * 5
    },
    Threading: {
      enable: true,
      thumbnailThreads: 0
    },
    Indexing: {
      folderPreviewSize: 2,
      cachedFolderTimeout: 1000 * 60 * 60,
      reIndexingSensitivity: ServerConfig.ReIndexingSensitivity.low,
      excludeFolderList: [],
      excludeFileList: []
    },
    Duplicates: {
      listingLimit: 1000
    },
    Tasks: {
      scheduled: [{
        taskName: DefaultsTasks[DefaultsTasks['Database Reset']],
        config: {},
        trigger: {type: TaskTriggerType.never}
      }, {
        taskName: DefaultsTasks[DefaultsTasks.Indexing],
        config: {},
        trigger: {type: TaskTriggerType.never}
      }, {
        taskName: DefaultsTasks[DefaultsTasks['Video Converting']],
        config: {},
        trigger: {type: TaskTriggerType.never}
      }]
    },
    Video: {
      transcoding: {
        bitRate: 5 * 1024 * 1024,
        codec: 'libx264',
        format: 'mp4',
        fps: 25,
        resolution: 720
      }
    }
  };
  private ConfigLoader: any;

  public setDatabaseType(type: ServerConfig.DatabaseType) {
    this.Server.Database.type = type;
    if (type === ServerConfig.DatabaseType.memory) {
      this.Client.Search.enabled = false;
      this.Client.Sharing.enabled = false;
    }
  }

  public load() {
    this.addComment();
    ConfigLoader.loadBackendConfig(this,
      path.join(__dirname, './../../../config.json'),
      [['PORT', 'Server-port'],
        ['MYSQL_HOST', 'Server-Database-mysql-host'],
        ['MYSQL_PASSWORD', 'Server-Database-mysql-password'],
        ['MYSQL_USERNAME', 'Server-Database-mysql-username'],
        ['MYSQL_DATABASE', 'Server-Database-mysql-database']]);
    this.removeComment();

    if (Utils.enumToArray(UserRoles).map(r => r.key).indexOf(this.Client.unAuthenticatedUserRole) === -1) {
      throw new Error('Unknown user role for Client.unAuthenticatedUserRole, found: ' + this.Client.unAuthenticatedUserRole);
    }
    if (Utils.enumToArray(ServerConfig.LogLevel).map(r => r.key).indexOf(this.Server.Log.level) === -1) {
      throw new Error('Unknown Server.log.level, found: ' + this.Server.Log.level);
    }
    if (Utils.enumToArray(ServerConfig.SQLLogLevel).map(r => r.key).indexOf(this.Server.Log.sqlLevel) === -1) {
      throw new Error('Unknown Server.log.level, found: ' + this.Server.Log.sqlLevel);
    }

  }

  public save() {
    try {
      this.addComment();
      ConfigLoader.saveConfigFile(path.join(__dirname, './../../../config.json'), this);
      this.removeComment();
    } catch (e) {
      throw new Error('Error during saving config: ' + e.toString());
    }
  }

  public original(): PrivateConfigClass {
    const cfg = new PrivateConfigClass();
    cfg.load();
    return cfg;
  }

  private addComment() {
    (<any>this)['__NOTE'] = 'NOTE: this config is not intended for manual edit, ' +
      'use the app UI instead as it has comments and descriptions.';
  }

  private removeComment() {
    delete (<any>this)['__NOTE'];
  }
}

