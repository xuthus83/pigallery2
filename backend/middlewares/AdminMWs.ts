import {NextFunction, Request, Response} from "express";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {ObjectManagerRepository} from "../model/ObjectManagerRepository";
import {Logger} from "../Logger";
import {MySQLConnection} from "../model/mysql/MySQLConnection";
import {DataBaseConfig, DatabaseType} from "../../common/config/private/IPrivateConfig";
import {Config} from "../../common/config/private/Config";


const LOG_TAG = "[AdminMWs]";
export class AdminMWs {


  public static async updateDatabaseSettings(req: Request, res: Response, next: NextFunction) {

    if ((typeof req.body === 'undefined') || (typeof req.body.databaseSettings === 'undefined')) {
      return next(new Error(ErrorCodes.INPUT_ERROR, "databaseSettings is needed"));
    }

    const databaseSettings = <DataBaseConfig>req.body.databaseSettings;

    try {
      if (databaseSettings.type == DatabaseType.mysql) {
        await MySQLConnection.tryConnection(databaseSettings);
      }
      Config.Server.database = databaseSettings;
      Config.save();
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
    if ((typeof req.body === 'undefined') || (typeof req.body.databaseSettings === 'undefined')) {
      return next(new Error(ErrorCodes.INPUT_ERROR, "databaseSettings is needed"));
    }

    const databaseSettings = <DataBaseConfig>req.body.databaseSettings;

    try {
      if (databaseSettings.type == DatabaseType.mysql) {
        await MySQLConnection.tryConnection(databaseSettings);
      }
      return next();
    } catch (err) {
      return next(new Error(ErrorCodes.SETTINGS_ERROR, "Settings error: " + JSON.stringify(err, null, '  '), err));
    }
  }
}
