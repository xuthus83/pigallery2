import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {ObjectManagerRepository} from "../model/ObjectManagerRepository";
import {Logger} from "../Logger";
import {MySQLConnection} from "../model/mysql/MySQLConnection";
import {DataBaseConfig, DatabaseType} from "../../common/config/private/IPrivateConfig";
import {Config} from "../../common/config/private/Config";
import {ConfigDiagnostics} from "../model/ConfigDiagnostics";
import {MapConfig} from "../../common/config/public/ConfigClass";


const LOG_TAG = "[AdminMWs]";
export class AdminMWs {


  public static async updateDatabaseSettings(req: Request, res: Response, next: NextFunction) {

    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new Error(ErrorCodes.INPUT_ERROR, "settings is needed"));
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
      return next(new Error(ErrorCodes.SETTINGS_ERROR, "Error saving database settings", err));
    }
  }


  public static async testDatabaseSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new Error(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    const databaseSettings = <DataBaseConfig>req.body.settings;

    try {
      if (databaseSettings.type == DatabaseType.mysql) {
        await ConfigDiagnostics.testDatabase(databaseSettings);
      }
      return next();
    } catch (err) {
      return next(new Error(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }


  public static async updateMapSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new Error(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    try {
      await ConfigDiagnostics.testMapConfig(<MapConfig>req.body.settings);

      Config.Client.Map = <MapConfig>req.body.settings;
      //only updating explicitly set config (not saving config set by the diagnostics)
      const original = Config.original();
      original.Client.Map = <MapConfig>req.body.settings;
      original.save();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, "new config:");
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));
      return next();
    } catch (err) {
      return next(new Error(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }

  public static async testMapSettings(req: Request, res: Response, next: NextFunction) {
    if ((typeof req.body === 'undefined') || (typeof req.body.settings === 'undefined')) {
      return next(new Error(ErrorCodes.INPUT_ERROR, "settings is needed"));
    }

    try {
      await ConfigDiagnostics.testMapConfig(<MapConfig>req.body.settings);
      return next();
    } catch (err) {
      return next(new Error(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }
}
