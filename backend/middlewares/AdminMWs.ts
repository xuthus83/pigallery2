import {NextFunction, Request, Response} from "express";
import {ErrorCodes, ErrorDTO} from "../../common/entities/Error";
import {ObjectManagerRepository} from "../model/ObjectManagerRepository";
import {Logger} from "../Logger";
import {SQLConnection} from "../model/sql/SQLConnection";
import {DataBaseConfig, DatabaseType, ThumbnailConfig} from "../../common/config/private/IPrivateConfig";
import {Config} from "../../common/config/private/Config";
import {ConfigDiagnostics} from "../model/ConfigDiagnostics";
import {ClientConfig} from "../../common/config/public/ConfigClass";
import {BasicConfigDTO} from "../../common/entities/settings/BasicConfigDTO";
import {OtherConfigDTO} from "../../common/entities/settings/OtherConfigDTO";
import {ProjectPath} from "../ProjectPath";


const LOG_TAG = "[AdminMWs]";

export class AdminMWs {


  public static async updateDatabaseSettings(req: Request, res: Response, next: NextFunction) {

    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    const databaseSettings = <DataBaseConfig>req.body.settings;

    try {
      if (databaseSettings.type != DatabaseType.memory) {
        await SQLConnection.tryConnection(databaseSettings);
      }
      Config.Server.database = databaseSettings;
      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      original.Server.database = databaseSettings;
      if (databaseSettings.type == DatabaseType.memory) {
        original.Client.Sharing.enabled = false;
        original.Client.Search.enabled = false;
      }
      original.save();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));

      ObjectManagerRepository.reset();
      if (Config.Server.database.type != DatabaseType.memory) {
        await ObjectManagerRepository.InitSQLManagers();
      } else {
        await ObjectManagerRepository.InitMemoryManagers();
      }

      return next();
    } catch (err) {
      if (err instanceof Error) {
        return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Error while saving database settings: " + err.toString(), err));
      }
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Error while saving database settings", err));
    }
  }

  public static async updateMapSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    try {
      await ConfigDiagnostics.testMapConfig(<ClientConfig.MapConfig>req.body.settings);

      Config.Client.Map = <ClientConfig.MapConfig>req.body.settings;
      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      original.Client.Map = <ClientConfig.MapConfig>req.body.settings;
      original.save();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }

  public static async updateShareSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    try {
      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      await ConfigDiagnostics.testSharingConfig(<ClientConfig.SharingConfig>req.body.settings, original);

      Config.Client.Sharing = <ClientConfig.SharingConfig>req.body.settings;
      original.Client.Sharing = <ClientConfig.SharingConfig>req.body.settings;
      original.save();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }


  public static async updateSearchSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    try {
      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      await ConfigDiagnostics.testSearchConfig(<ClientConfig.SearchConfig>req.body.settings, original);

      Config.Client.Search = <ClientConfig.SearchConfig>req.body.settings;
      original.Client.Search = <ClientConfig.SearchConfig>req.body.settings;
      original.save();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }


  public static async updateAuthenticationSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    try {
      Config.Client.authenticationRequired = <boolean>req.body.settings;
      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      original.Client.authenticationRequired = <boolean>req.body.settings;
      original.save();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }

  public static async updateThumbnailSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    try {
      const settings: {
        server: ThumbnailConfig,
        client: ClientConfig.ThumbnailConfig
      } = req.body.settings;

      await ConfigDiagnostics.testServerThumbnailConfig(settings.server);
      await ConfigDiagnostics.testClientThumbnailConfig(settings.client);
      Config.Server.thumbnail = settings.server;
      Config.Client.Thumbnail = settings.client;
      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      original.Server.thumbnail = settings.server;
      original.Client.Thumbnail = settings.client;
      original.save();
      ProjectPath.reset();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));
      return next();
    } catch (err) {
      if (err instanceof Error) {
        return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Settings error: " + err.toString(), err));
      }
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }


  public static async updateBasicSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    try {
      const settings: BasicConfigDTO = req.body.settings;
      await ConfigDiagnostics.testImageFolder(settings.imagesFolder);
      Config.Server.port = settings.port;
      Config.Server.imagesFolder = settings.imagesFolder;
      Config.Client.publicUrl = settings.publicUrl;
      Config.Client.applicationTitle = settings.applicationTitle;
      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      original.Server.port = settings.port;
      original.Server.imagesFolder = settings.imagesFolder;
      original.Client.publicUrl = settings.publicUrl;
      original.Client.applicationTitle = settings.applicationTitle;
      original.save();
      ProjectPath.reset();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }


  public static async updateOtherSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    try {
      const settings: OtherConfigDTO = req.body.settings;
      Config.Client.enableCache = settings.enableCache;
      Config.Client.enableOnScrollRendering = settings.enableOnScrollRendering;
      Config.Client.enableOnScrollThumbnailPrioritising = settings.enableOnScrollThumbnailPrioritising;

      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      original.Client.enableCache = settings.enableCache;
      original.Client.enableOnScrollRendering = settings.enableOnScrollRendering;
      original.Client.enableOnScrollThumbnailPrioritising = settings.enableOnScrollThumbnailPrioritising;
      original.Server.enableThreading = settings.enableThreading;
      original.save();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }


  public static startIndexing(req: Request, res: Response, next: NextFunction) {
    try {
      ObjectManagerRepository.getInstance().IndexingManager.startIndexing();
      req.resultPipe = "ok";
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Indexing error: " + JSON.stringify(err, null, '  '), err));
    }
  }

  public static getIndexingProgress(req: Request, res: Response, next: NextFunction) {
    try {
      req.resultPipe = ObjectManagerRepository.getInstance().IndexingManager.getProgress();
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Indexing error: " + JSON.stringify(err, null, '  '), err));
    }
  }

  public static cancelIndexing(req: Request, res: Response, next: NextFunction) {
    try {
      ObjectManagerRepository.getInstance().IndexingManager.cancelIndexing();
      req.resultPipe = "ok";
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Indexing error: " + JSON.stringify(err, null, '  '), err));
    }
  }

  public static async resetIndexes(req: Request, res: Response, next: NextFunction) {
    try {
      await ObjectManagerRepository.getInstance().IndexingManager.reset();
      req.resultPipe = "ok";
      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "Indexing error: " + JSON.stringify(err, null, '  '), err));
    }
  }
}
