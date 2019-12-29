import {PublicConfigClass} from '../public/ConfigClass';
import {IPrivateConfig, ServerConfig} from './IPrivateConfig';
import {JobTriggerType} from '../../entities/job/JobScheduleDTO';
import {DefaultsJobs} from '../../entities/job/JobDTO';

/**
 * This configuration will be only at backend
 */
export class PrivateConfigDefaultsClass extends PublicConfigClass implements IPrivateConfig {

  public Server: ServerConfig.Config = {
    port: 80,
    host: '0.0.0.0',
    Media: {
      folder: 'demo/images',
      tempFolder: 'demo/tmp',
      photoProcessingLibrary: ServerConfig.PhotoProcessingLib.sharp,
      Thumbnail: {
        qualityPriority: true,
        personFaceMargin: 0.6
      },
      Photo: {
        Converting: {
          onTheFly: true,
          resolution: 1080
        }
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
    },
    Log: {
      level: ServerConfig.LogLevel.info,
      sqlLevel: ServerConfig.SQLLogLevel.error
    },
    sessionTimeout: 1000 * 60 * 60 * 24 * 7,
    photoMetadataSize: 512 * 1024,
    Database: {
      type: ServerConfig.DatabaseType.sqlite,
      dbFolder: 'db',
      mysql: {
        host: '',
        username: '',
        password: '',
        database: ''

      }
    },
    Sharing: {
      updateTimeout: 1000 * 60 * 5
    },
    Threading: {
      enabled: true,
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
    Jobs: {
      maxSavedProgress: 10,
      scheduled: [
        {
          name: DefaultsJobs[DefaultsJobs.Indexing],
          jobName: DefaultsJobs[DefaultsJobs.Indexing],
          config: {},
          trigger: {type: JobTriggerType.never}
        },
        {
          name: DefaultsJobs[DefaultsJobs['Thumbnail Generation']],
          jobName: DefaultsJobs[DefaultsJobs['Thumbnail Generation']],
          config: {sizes: [160]},
          trigger: {
            type: JobTriggerType.after,
            afterScheduleName: DefaultsJobs[DefaultsJobs.Indexing]
          }
        },
      /*  {
          name: DefaultsJobs[DefaultsJobs['Photo Converting']],
          jobName: DefaultsJobs[DefaultsJobs['Photo Converting']],
          config: {},
          trigger: {
            type: JobTriggerType.after,
            afterScheduleName: DefaultsJobs[DefaultsJobs['Thumbnail Generation']]
          }
        },*/
        {
          name: DefaultsJobs[DefaultsJobs['Video Converting']],
          jobName: DefaultsJobs[DefaultsJobs['Video Converting']],
          config: {},
          trigger: {
            type: JobTriggerType.after,
            afterScheduleName: DefaultsJobs[DefaultsJobs['Thumbnail Generation']]
          }
        },
        {
          name: DefaultsJobs[DefaultsJobs['Temp Folder Cleaning']],
          jobName: DefaultsJobs[DefaultsJobs['Temp Folder Cleaning']],
          config: {},
          trigger: {
            type: JobTriggerType.after,
            afterScheduleName: DefaultsJobs[DefaultsJobs['Video Converting']]
          }
        }
      ]
    }
  };
}

