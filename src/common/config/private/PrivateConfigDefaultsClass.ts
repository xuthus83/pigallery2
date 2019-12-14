import {PublicConfigClass} from '../public/ConfigClass';
import {IPrivateConfig, ServerConfig} from './IPrivateConfig';
import {TaskTriggerType} from '../../entities/task/TaskScheduleDTO';
import {DefaultsTasks} from '../../entities/task/TaskDTO';

/**
 * This configuration will be only at backend
 */
export class PrivateConfigDefaultsClass extends PublicConfigClass implements IPrivateConfig {

  public Server: ServerConfig.Config = {
    port: 80,
    host: '0.0.0.0',
    imagesFolder: 'demo/images',
    Thumbnail: {
      folder: 'demo/tmp',
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
      },
      memory: {
        usersFile: 'user.db'
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
}

