import {NextFunction, Request, Response} from "express";
import {ErrorCodes, ErrorDTO} from "../../common/entities/Error";
import {ObjectManagerRepository} from "../model/ObjectManagerRepository";
import {Logger} from "../Logger";
import {MySQLConnection} from "../model/mysql/MySQLConnection";
import {DataBaseConfig, DatabaseType, ThumbnailConfig} from "../../common/config/private/IPrivateConfig";
import {Config} from "../../common/config/private/Config";
import {ConfigDiagnostics} from "../model/ConfigDiagnostics";
import {ClientConfig} from "../../common/config/public/ConfigClass";
import set = Reflect.set;


const LOG_TAG = "[AdminMWs]";
export class AdminMWs {


  public static async updateDatabaseSettings(req: Request, res: Response, next: NextFunction) {

    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    const databaseSettings = <DataBaseConfig>req.body.settings;

    try {
      if (databaseSettings.type == DatabaseType.mysql) {
        await MySQLConnection.tryConnection(databaseSettings);
      }
      Config.Server.database = databaseSettings;
      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      original.Server.database = databaseSettings;
      original.save();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));

      ObjectManagerRepository.reset();
      if (Config.Server.database.type == DatabaseType.mysql) {
        await ObjectManagerRepository.InitMySQLManagers();
      } else {
        await ObjectManagerRepository.InitMemoryManagers();
      }

      return next();
    } catch (err) {
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, "ErrorDTO saving database settings", err));
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

  public static async  updateAuthenticationSettings(req: Request, res: Response, next: NextFunction) {
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

  public static async  updateThumbnailSettings(req: Request, res: Response, next: NextFunction) {
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


}
