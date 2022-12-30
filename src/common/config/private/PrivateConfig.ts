/* eslint-disable @typescript-eslint/no-inferrable-types */
import 'reflect-metadata';
import {
  AfterJobTrigger,
  JobScheduleDTO,
  JobTrigger,
  JobTriggerType,
  NeverJobTrigger,
  PeriodicJobTrigger,
  ScheduledJobTrigger,
} from '../../entities/job/JobScheduleDTO';
import {
  ClientConfig,
  ClientGPXCompressingConfig,
  ClientMediaConfig,
  ClientMetaFileConfig,
  ClientPhotoConfig,
  ClientPhotoConvertingConfig,
  ClientServiceConfig,
  ClientSharingConfig,
  ClientThumbnailConfig,
  ClientUserConfig,
  ClientVideoConfig,
  ConfigPriority,
  TAGS
} from '../public/ClientConfig';
import {SubConfigClass} from 'typeconfig/src/decorators/class/SubConfigClass';
import {ConfigProperty} from 'typeconfig/src/decorators/property/ConfigPropoerty';
import {DefaultsJobs} from '../../entities/job/JobDTO';
import {SearchQueryDTO, SearchQueryTypes, TextSearch,} from '../../entities/SearchQueryDTO';
import {SortingMethods} from '../../entities/SortingMethods';
import {UserRoles} from '../../entities/UserDTO';

if (typeof $localize === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.$localize = (s) => s;
}

export enum DatabaseType {
  memory = 1,
  mysql = 2,
  sqlite = 3,
}

export enum LogLevel {
  error = 1,
  warn = 2,
  info = 3,
  verbose = 4,
  debug = 5,
  silly = 6,
}

export enum SQLLogLevel {
  none = 1,
  error = 2,
  all = 3,
}

export enum ReIndexingSensitivity {
  low = 1,
  medium = 2,
  high = 3,
}

export enum FFmpegPresets {
  ultrafast = 1,
  superfast = 2,
  veryfast = 3,
  faster = 4,
  fast = 5,
  medium = 6,
  slow = 7,
  slower = 8,
  veryslow = 9,
  placebo = 10,
}

export type videoCodecType = 'libvpx-vp9' | 'libx264' | 'libvpx' | 'libx265';
export type videoResolutionType =
  | 240
  | 360
  | 480
  | 720
  | 1080
  | 1440
  | 2160
  | 4320;
export type videoFormatType = 'mp4' | 'webm';

@SubConfigClass()
export class MySQLConfig {
  @ConfigProperty({
    envAlias: 'MYSQL_HOST',
    tags:
      {
        name: $localize`Host`,
        priority: ConfigPriority.advanced
      },
  })
  host: string = 'localhost';
  @ConfigProperty({
    envAlias: 'MYSQL_PORT', min: 0, max: 65535,
    tags:
      {
        name: $localize`Port`,
        priority: ConfigPriority.advanced
      },
  })
  port: number = 3306;
  @ConfigProperty({
    envAlias: 'MYSQL_DATABASE',
    tags:
      {
        name: $localize`Database`,
        priority: ConfigPriority.advanced
      },
  })
  database: string = 'pigallery2';
  @ConfigProperty({
    envAlias: 'MYSQL_USERNAME',
    tags:
      {
        name: $localize`Username`,
        priority: ConfigPriority.advanced
      },
  })
  username: string = '';
  @ConfigProperty({
    envAlias: 'MYSQL_PASSWORD', type: 'password',
    tags:
      {
        name: $localize`Password`,
        priority: ConfigPriority.advanced
      }
  })
  password: string = '';
}

@SubConfigClass()
export class SQLiteConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Sqlite db filename`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Sqlite will save the db with this filename.`,
  })
  DBFileName: string = 'sqlite.db';
}

@SubConfigClass()
export class UserConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Name`,
        priority: ConfigPriority.underTheHood
      }
  })
  name: string;

  @ConfigProperty({
    type: UserRoles,
    tags:
      {
        name: $localize`Role`,
        priority: ConfigPriority.underTheHood
      },
  })
  role: UserRoles = UserRoles.User;

  @ConfigProperty({
    tags:
      {
        name: $localize`Password`,
        priority: ConfigPriority.underTheHood,
        relevant: (c: UserConfig) => !c.encrypted
      },
    description: $localize`Unencrypted, temporary password. App will encrypt it and delete this.`
  })
  password: string;
  @ConfigProperty({
    tags:
      {
        name: $localize`Encrypted password`,
        priority: ConfigPriority.underTheHood,
        secret: true
      },
  })
  encryptedPassword: string | undefined;

  @ConfigProperty({
    tags:
      {
        priority: ConfigPriority.underTheHood,
        relevant: () => false // never render this on UI. Only used to indicate that encryption is done.
      } as TAGS,
  })
  encrypted: boolean;

  constructor(name?: string, password?: string, role?: UserRoles) {
    if (name) {
      this.name = name;
    }
    if (typeof role !== 'undefined') {
      this.role = role;
    }
    if (password) {
      this.password = password;
    }
  }
}

@SubConfigClass()
export class ServerDataBaseConfig {
  @ConfigProperty<DatabaseType, ServerConfig>({
    type: DatabaseType,
    onNewValue: (value, config) => {
      if (config && value === DatabaseType.memory) {
        config.Search.enabled = false;
        config.Sharing.enabled = false;
      }
    },
    tags:
      {
        name: $localize`Type`,
        priority: ConfigPriority.advanced
      },
  })
  type: DatabaseType = DatabaseType.sqlite;

  @ConfigProperty({
    tags:
      {
        name: $localize`Database folder`,
        priority: ConfigPriority.advanced
      },
    description: $localize`All file-based data will be stored here (sqlite database, user database in case of memory db, job history data).`,
  })
  dbFolder: string = 'db';

  @ConfigProperty({
    tags:
      {
        name: $localize`SQLite`,
        relevant: (c: any) => c.type === DatabaseType.sqlite,
      }
  })
  sqlite?: SQLiteConfig = new SQLiteConfig();

  @ConfigProperty({
    tags:
      {
        name: $localize`MySQL`,
        relevant: (c: any) => c.type === DatabaseType.mysql,
      }
  })
  mysql?: MySQLConfig = new MySQLConfig();


}


@SubConfigClass()
export class ServerUserConfig extends ClientUserConfig {
  @ConfigProperty({
    arrayType: UserConfig,
    tags:
      {
        name: $localize`Enforced users`,
        priority: ConfigPriority.underTheHood,
        uiOptional: true
      } as TAGS,
    description: $localize`Creates these users in the DB if they do not exist. If a user with this name exist, it won't be overwritten, even if the role is different.`,
  })
  enforcedUsers: UserConfig[] = [];
}


@SubConfigClass()
export class ServerThumbnailConfig extends ClientThumbnailConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Enforced users`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`if true, 'lanczos3' will used to scale photos, otherwise faster but lowe quality 'nearest'.`
  })
  useLanczos3: boolean = true;
  @ConfigProperty({
    max: 100, min: 1, type: 'unsignedInt',
    tags:
      {
        name: $localize`Converted photo and thumbnail quality`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Between 0-100.`
  })
  quality = 80;
  @ConfigProperty({
    type: 'ratio',
    tags:
      {
        name: $localize`Person face margin`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Person face size ratio on the face thumbnail.`
  })
  personFaceMargin: number = 0.6; // in ration [0-1]
}

@SubConfigClass()
export class ServerGPXCompressingConfig extends ClientGPXCompressingConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`OnTheFly *.gpx compression`,
        priority: ConfigPriority.advanced,
        uiDisabled: (sc: ServerGPXCompressingConfig, c: ServerConfig) => !c.Map.enabled || !sc.enabled || !c.MetaFile.gpx
      },
    description: $localize`Enables on the fly *.gpx compression.`,
  })
  onTheFly: boolean = true;
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Min distance`,
        priority: ConfigPriority.underTheHood,
        uiDisabled: (sc: ServerGPXCompressingConfig, c: ServerConfig) => !c.Map.enabled || !sc.enabled || !c.MetaFile.gpx
      },
    description: $localize`Filters out entry that are closer than this in meters.`
  })
  minDistance: number = 5;
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Min time delta`,
        priority: ConfigPriority.underTheHood,
        unit: 'ms',
        uiDisabled: (sc: ServerGPXCompressingConfig, c: ServerConfig) => !c.Map.enabled || !sc.enabled || !c.MetaFile.gpx
      } as TAGS,
    description: $localize`Filters out entry that are closer than this in time in milliseconds.`
  })
  minTimeDistance: number = 5000;
}

@SubConfigClass()
export class ServerMetaFileConfig extends ClientMetaFileConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`GPX compression`,
        priority: ConfigPriority.advanced
      }
  })
  GPXCompressing: ServerGPXCompressingConfig = new ServerGPXCompressingConfig();
}


@SubConfigClass()
export class ServerSharingConfig extends ClientSharingConfig {
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Update timeout`,
        priority: ConfigPriority.underTheHood,
        unit: 'ms'
      } as TAGS,
    description: $localize`After creating a sharing link, it can be updated for this long.`
  })
  updateTimeout: number = 1000 * 60 * 5;
}

@SubConfigClass()
export class ServerIndexingConfig {
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Index cache timeout`,
        priority: ConfigPriority.underTheHood,
        unit: 'ms'
      } as TAGS,
    description: $localize`If there was no indexing in this time, it reindexes. (skipped if indexes are in DB and sensitivity is low).`
  })
  cachedFolderTimeout: number = 1000 * 60 * 60; // Do not rescans the folder if seems ok
  @ConfigProperty({
    type: ReIndexingSensitivity,
    tags:
      {
        name: $localize`Folder reindexing sensitivity`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Set the reindexing sensitivity. High value check the folders for change more often.`
  })
  reIndexingSensitivity: ReIndexingSensitivity = ReIndexingSensitivity.low;
  @ConfigProperty({
    arrayType: 'string',
    tags:
      {
        name: $localize`Exclude Folder List`,
        priority: ConfigPriority.advanced,
        uiOptional: true,
        uiAllowSpaces: true
      } as TAGS,
    description: $localize`Folders to exclude from indexing. If an entry starts with '/' it is treated as an absolute path. If it doesn't start with '/' but contains a '/', the path is relative to the image directory. If it doesn't contain a '/', any folder with this name will be excluded.`,
  })
  excludeFolderList: string[] = ['.Trash-1000', '.dtrash', '$RECYCLE.BIN'];
  @ConfigProperty({
    arrayType: 'string',
    tags:
      {
        name: $localize`Exclude File List`,
        priority: ConfigPriority.advanced,
        uiOptional: true

      } as TAGS,
    description: $localize`Files that mark a folder to be excluded from indexing. Any folder that contains a file with this name will be excluded from indexing.`,
  })
  excludeFileList: string[] = [];
}

@SubConfigClass()
export class ServerThreadingConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Threading`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Runs directory scanning and thumbnail generation in a different thread.`
  })
  enabled: boolean = true;
  @ConfigProperty({
    tags:
      {
        name: $localize`Thumbnail threads`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Number of threads that are used to generate thumbnails. If 0, number of 'CPU cores -1' threads will be used.`,
  })
  thumbnailThreads: number = 0; // if zero-> CPU count -1
}

@SubConfigClass()
export class ServerDuplicatesConfig {
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Max duplicates`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number of duplicates to list.`
  })
  listingLimit: number = 1000;
}

@SubConfigClass()
export class ServerLogConfig {
  @ConfigProperty({
    type: LogLevel,
    tags: {
      name: $localize`Level`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Logging level.`
  })
  level: LogLevel = LogLevel.info;
  @ConfigProperty({
    type: SQLLogLevel,
    tags: {
      name: $localize`Sql Level`,
      priority: ConfigPriority.underTheHood,
    },
    description: $localize`Logging level for SQL queries.`
  })
  sqlLevel: SQLLogLevel = SQLLogLevel.error;
  @ConfigProperty({
    tags: {
      name: $localize`Server timing`,
      priority: ConfigPriority.underTheHood,
    },
    description: $localize`If enabled. The app ads "Server-Timing" http header to the response.`
  })
  logServerTiming: boolean = false;
}

@SubConfigClass()
export class NeverJobTriggerConfig implements NeverJobTrigger {
  @ConfigProperty({type: JobTriggerType})
  readonly type = JobTriggerType.never;
}

@SubConfigClass()
export class ScheduledJobTriggerConfig implements ScheduledJobTrigger {
  @ConfigProperty({type: JobTriggerType})
  readonly type = JobTriggerType.scheduled;

  @ConfigProperty({type: 'unsignedInt'})
  time: number; // data time
}

@SubConfigClass()
export class PeriodicJobTriggerConfig implements PeriodicJobTrigger {
  @ConfigProperty({type: JobTriggerType})
  readonly type = JobTriggerType.periodic;
  @ConfigProperty({type: 'unsignedInt', max: 7})
  periodicity: number | undefined = 7; // 0-6: week days 7 every day
  @ConfigProperty({type: 'unsignedInt', max: 23 * 60 + 59})
  atTime: number | undefined = 0; // day time
}

@SubConfigClass()
export class AfterJobTriggerConfig implements AfterJobTrigger {
  @ConfigProperty({type: JobTriggerType})
  readonly type = JobTriggerType.after;
  @ConfigProperty()
  afterScheduleName: string | undefined; // runs after schedule

  constructor(afterScheduleName?: string) {
    this.afterScheduleName = afterScheduleName;
  }
}

@SubConfigClass()
export class JobScheduleConfig implements JobScheduleDTO {
  @ConfigProperty()
  name: string;
  @ConfigProperty()
  jobName: string;
  @ConfigProperty()
  config: Record<string, string | number | string[] | number[]> = {};
  @ConfigProperty()
  allowParallelRun: boolean = false;
  @ConfigProperty({
    type: NeverJobTriggerConfig,
    typeBuilder: (v: JobTrigger) => {
      const type = typeof v.type === 'number' ? v.type : JobTriggerType[v.type];
      switch (type) {
        case JobTriggerType.after:
          return AfterJobTriggerConfig;
        case JobTriggerType.never:
          return NeverJobTriggerConfig;
        case JobTriggerType.scheduled:
          return ScheduledJobTriggerConfig;
        case JobTriggerType.periodic:
          return PeriodicJobTriggerConfig;
      }
      return null;
    },
  })
  trigger:
    | AfterJobTriggerConfig
    | NeverJobTriggerConfig
    | PeriodicJobTriggerConfig
    | ScheduledJobTriggerConfig;

  constructor(
    name: string,
    jobName: string,
    trigger:
      | AfterJobTriggerConfig
      | NeverJobTriggerConfig
      | PeriodicJobTriggerConfig
      | ScheduledJobTriggerConfig,
    config: any = {},
    allowParallelRun: boolean = false
  ) {
    this.name = name;
    this.jobName = jobName;
    this.config = config;
    this.allowParallelRun = allowParallelRun;
    this.trigger = trigger;
  }
}

@SubConfigClass()
export class ServerJobConfig {
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Max saved progress`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Job history size.`
  })
  maxSavedProgress: number = 20;
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Processing batch size`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Jobs load this many photos or videos form the DB for processing at once.`
  })
  mediaProcessingBatchSize: number = 1000;
  @ConfigProperty({arrayType: JobScheduleConfig})
  scheduled: JobScheduleConfig[] = [
    new JobScheduleConfig(
      DefaultsJobs[DefaultsJobs.Indexing],
      DefaultsJobs[DefaultsJobs.Indexing],
      new NeverJobTriggerConfig(),
      {indexChangesOnly: true} // set config explicitly so it not undefined on the UI
    ),
    new JobScheduleConfig(
      DefaultsJobs[DefaultsJobs['Preview Filling']],
      DefaultsJobs[DefaultsJobs['Preview Filling']],
      new AfterJobTriggerConfig(DefaultsJobs[DefaultsJobs['Indexing']]),
      {}
    ),
    new JobScheduleConfig(
      DefaultsJobs[DefaultsJobs['Thumbnail Generation']],
      DefaultsJobs[DefaultsJobs['Thumbnail Generation']],
      new AfterJobTriggerConfig(DefaultsJobs[DefaultsJobs['Preview Filling']]),
      {sizes: [240], indexedOnly: true}
    ),
    new JobScheduleConfig(
      DefaultsJobs[DefaultsJobs['Photo Converting']],
      DefaultsJobs[DefaultsJobs['Photo Converting']],
      new AfterJobTriggerConfig(DefaultsJobs[DefaultsJobs['Thumbnail Generation']]),
      {indexedOnly: true}
    ),
    new JobScheduleConfig(
      DefaultsJobs[DefaultsJobs['Video Converting']],
      DefaultsJobs[DefaultsJobs['Video Converting']],
      new AfterJobTriggerConfig(DefaultsJobs[DefaultsJobs['Photo Converting']]),
      {indexedOnly: true}
    ),
    new JobScheduleConfig(
      DefaultsJobs[DefaultsJobs['GPX Compression']],
      DefaultsJobs[DefaultsJobs['GPX Compression']],
      new AfterJobTriggerConfig(DefaultsJobs[DefaultsJobs['Video Converting']]),
      {indexedOnly: true}
    ),
    new JobScheduleConfig(
      DefaultsJobs[DefaultsJobs['Temp Folder Cleaning']],
      DefaultsJobs[DefaultsJobs['Temp Folder Cleaning']],
      new AfterJobTriggerConfig(DefaultsJobs[DefaultsJobs['GPX Compression']]),
      {indexedOnly: true}
    ),
  ];
}

@SubConfigClass()
export class VideoTranscodingConfig {
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Bit rate`,
        priority: ConfigPriority.advanced,
        unit: 'bps'
      },
    description: $localize`Target bit rate of the output video will be scaled down this this. This should be less than the upload rate of your home server.`
  })
  bitRate: number = 5 * 1024 * 1024;
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Resolution`,
        priority: ConfigPriority.advanced,
        uiOptions: [720, 1080, 1440, 2160, 4320],
        unit: 'px'
      },
    description: $localize`The height of the output video will be scaled down to this, while keeping the aspect ratio.`
  })
  resolution: videoResolutionType = 720;
  @ConfigProperty({
    type: 'positiveFloat',
    tags:
      {
        name: $localize`FPS`,
        priority: ConfigPriority.advanced,
        uiOptions: [24, 25, 30, 48, 50, 60]
      },
    description: $localize`Target frame per second (fps) of the output video will be scaled down this this.`
  })
  fps: number = 25;
  @ConfigProperty({
    tags:
      {
        name: $localize`Format`,
        priority: ConfigPriority.advanced,
        uiOptions: ['mp4', 'webm']
      }
  })
  format: videoFormatType = 'mp4';
  @ConfigProperty({
    tags:
      {
        name: $localize`MP4 codec`,
        priority: ConfigPriority.advanced,
        uiOptions: ['libx264', 'libx265'],
        relevant: (c: any) => c.format === 'mp4'
      }
  })
  mp4Codec: videoCodecType = 'libx264';
  @ConfigProperty({
    tags:
      {
        name: $localize`Webm Codec`,
        priority: ConfigPriority.advanced,
        uiOptions: ['libvpx', 'libvpx-vp9'],
        relevant: (c: any) => c.format === 'webm'
      }
  })
  webmCodec: videoCodecType = 'libvpx';
  @ConfigProperty({
    type: 'unsignedInt', max: 51,
    tags:
      {
        name: $localize`CRF`,
        priority: ConfigPriority.underTheHood,
      },
    description: $localize`The range of the Constant Rate Factor (CRF) scale is 0–51, where 0 is lossless, 23 is the default, and 51 is worst quality possible.`,

  })
  crf: number = 23;
  @ConfigProperty({
    type: FFmpegPresets,
    tags:
      {
        name: $localize`Preset`,
        priority: ConfigPriority.advanced,
      },
    description: $localize`A preset is a collection of options that will provide a certain encoding speed to compression ratio. A slower preset will provide better compression (compression is quality per filesize).`,
  })
  preset: FFmpegPresets = FFmpegPresets.medium;

  @ConfigProperty({
    arrayType: 'string',
    tags: {
      name: $localize`Custom Options`,
      priority: ConfigPriority.underTheHood,
      hint: '-pass 2; -minrate 1M; -maxrate 1M; -bufsize 2M',
      uiAllowSpaces: true
    },
    description: $localize`It will be sent to ffmpeg as it is, as custom options.`,
  })
  customOptions: string[] = [];
}

@SubConfigClass()
export class ServerVideoConfig extends ClientVideoConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Video transcoding`,
      priority: ConfigPriority.advanced,
      uiDisabled: (sb: ClientVideoConfig) => !sb.enabled
    },
    description: $localize`To ensure smooth video playback, video transcoding is recommended to a lower bit rate than the server's upload rate.   The transcoded videos will be save to the thumbnail folder.  You can trigger the transcoding manually, but you can also create an automatic encoding job in advanced settings mode.`
  })
  transcoding: VideoTranscodingConfig = new VideoTranscodingConfig();
}

@SubConfigClass()
export class PhotoConvertingConfig extends ClientPhotoConvertingConfig {
  @ConfigProperty({
    tags: {
      name: $localize`On the fly converting`,
      priority: ConfigPriority.underTheHood,
      uiDisabled: (sc: PhotoConvertingConfig) =>
        !sc.enabled

    },
    description: $localize`Converts photos on the fly, when they are requested.`,
  })
  onTheFly: boolean = true;
  @ConfigProperty({
    type: 'unsignedInt',
    tags: {
      name: $localize`Resolution`,
      priority: ConfigPriority.advanced,
      uiDisabled: (sc: PhotoConvertingConfig) =>
        !sc.enabled
    },
    description: $localize`The shorter edge of the converted photo will be scaled down to this, while keeping the aspect ratio.`,
  })
  resolution: videoResolutionType = 1080;
}

@SubConfigClass()
export class ServerPhotoConfig extends ClientPhotoConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Photo resizing`,
      priority: ConfigPriority.advanced,
    }
  })
  Converting: PhotoConvertingConfig = new PhotoConvertingConfig();
}

@SubConfigClass()
export class ServerPreviewConfig {
  @ConfigProperty({
    type: 'object',
    tags: {
      name: $localize`Preview Filter query`,
      priority: ConfigPriority.advanced,
      uiType: 'SearchQuery'
    },
    description: $localize`Filters the sub-folders with this search query. If filter results no photo, the app will search again without the filter.`,
  })
  SearchQuery: SearchQueryDTO = {
    type: SearchQueryTypes.any_text,
    text: '',
  } as TextSearch;
  @ConfigProperty({
    arrayType: SortingMethods,
    tags: {
      name: $localize`Preview Sorting`,
      priority: ConfigPriority.advanced
    },
    description: $localize`If multiple preview is available sorts them by these methods and selects the first one.`,
  })
  Sorting: SortingMethods[] = [
    SortingMethods.descRating,
    SortingMethods.descDate,
  ];
}

@SubConfigClass()
export class ServerMediaConfig extends ClientMediaConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Images folder`,
      priority: ConfigPriority.basic,
      dockerSensitive: true
    },
    description: $localize`Images are loaded from this folder (read permission required)`,

  })
  folder: string = 'demo/images';
  @ConfigProperty({
    tags: {
      name: $localize`Temp folder`,
      priority: ConfigPriority.basic,
      dockerSensitive: true
    },
    description: $localize`Thumbnails, converted photos, videos will be stored here (write permission required)`,
  })
  tempFolder: string = 'demo/tmp';

  @ConfigProperty({
    type: 'unsignedInt',
    tags: {
      name: $localize`Metadata read buffer`,
      priority: ConfigPriority.underTheHood,
      githubIssue: 398,
      unit: 'bytes'
    },
    description: $localize`Only this many bites will be loaded when scanning photo/video for metadata. Increase this number if your photos shows up as square.`,
  })
  photoMetadataSize: number = 512 * 1024; // only this many bites will be loaded when scanning photo for metadata

  @ConfigProperty({
    tags: {
      name: $localize`Video`,
      priority: ConfigPriority.advanced
    },
    description: $localize`Video support uses ffmpeg. ffmpeg and ffprobe binaries need to be available in the PATH or the @ffmpeg-installer/ffmpeg and @ffprobe-installer/ffprobe optional node packages need to be installed.`
  })
  Video: ServerVideoConfig = new ServerVideoConfig();
  @ConfigProperty({
    tags: {
      name: $localize`Photo`,
      priority: ConfigPriority.advanced
    }
  })
  Photo: ServerPhotoConfig = new ServerPhotoConfig();
  @ConfigProperty({
    tags: {
      name: $localize`Thumbnail`,
      priority: ConfigPriority.advanced
    }
  })
  Thumbnail: ServerThumbnailConfig = new ServerThumbnailConfig();
}

@SubConfigClass()
export class ServerServiceConfig extends ClientServiceConfig {
  @ConfigProperty({
    arrayType: 'string',
    tags: {secret: true}
  })
  sessionSecret: string[] = [];

  @ConfigProperty({
    type: 'unsignedInt',
    tags: {
      name: $localize`Session Timeout`,
      priority: ConfigPriority.underTheHood,
      unit: 'ms'
    },
    description: $localize`Users kept logged in for this long time.`,
  })
  sessionTimeout: number = 1000 * 60 * 60 * 24 * 7; // in ms

  @ConfigProperty({
    tags: {
      name: $localize`Port`,
      priority: ConfigPriority.advanced,
      dockerSensitive: true
    },
    description: $localize`Port number. Port 80 is usually what you need.`,
    type: 'unsignedInt', envAlias: 'PORT', min: 0, max: 65535
  })
  port: number = 80;

  @ConfigProperty({
    tags: {
      name: $localize`Host`,
      priority: ConfigPriority.advanced,
      dockerSensitive: true
    },
    description: $localize`Server will accept connections from this IPv6 or IPv4 address.`,
  })
  host: string = '0.0.0.0';

  @ConfigProperty({
    tags: {
      name: $localize`Threading`,
      priority: ConfigPriority.underTheHood,
    }
  })
  Threading: ServerThreadingConfig = new ServerThreadingConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Logs`,
      priority: ConfigPriority.advanced,
    }
  })
  Log: ServerLogConfig = new ServerLogConfig();
}

@SubConfigClass()
export class ServerEnvironmentConfig {
  @ConfigProperty({volatile: true})
  upTime: string | undefined;
  @ConfigProperty({volatile: true})
  appVersion: string | undefined;
  @ConfigProperty({volatile: true})
  buildTime: string | undefined;
  @ConfigProperty({volatile: true})
  buildCommitHash: string | undefined;
  @ConfigProperty({volatile: true})
  isDocker: boolean | undefined;
}

@SubConfigClass<TAGS>()
export class ServerConfig extends ClientConfig {

  @ConfigProperty({volatile: true})
  Environment: ServerEnvironmentConfig = new ServerEnvironmentConfig();

  @ConfigProperty()
  Server: ServerServiceConfig = new ServerServiceConfig();

  @ConfigProperty()
  Database: ServerDataBaseConfig = new ServerDataBaseConfig();

  @ConfigProperty()
  Users: ServerUserConfig = new ServerUserConfig();

  @ConfigProperty()
  Indexing: ServerIndexingConfig = new ServerIndexingConfig();

  @ConfigProperty()
  Media: ServerMediaConfig = new ServerMediaConfig();

  @ConfigProperty()
  MetaFile: ServerMetaFileConfig = new ServerMetaFileConfig();

  @ConfigProperty()
  Preview: ServerPreviewConfig = new ServerPreviewConfig();

  @ConfigProperty()
  Sharing: ServerSharingConfig = new ServerSharingConfig();

  @ConfigProperty()
  Duplicates: ServerDuplicatesConfig = new ServerDuplicatesConfig();

  @ConfigProperty()
  Jobs: ServerJobConfig = new ServerJobConfig();
}

