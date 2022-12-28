import {NextFunction, Request, Response} from 'express';
import {ErrorCodes, ErrorDTO} from '../../../common/entities/Error';
import {Logger} from '../../Logger';
import {Config} from '../../../common/config/private/Config';
import {ConfigDiagnostics} from '../../model/diagnostics/ConfigDiagnostics';

const LOG_TAG = '[SettingsMWs]';


export class SettingsMWs {

  /**
   * General settings updating servcie
   * @param req
   * @param res
   * @param next
   */
  public static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    if ((typeof req.body === 'undefined')
      || (typeof req.body.settings === 'undefined')
      || (typeof req.body.settingsPath !== 'string')) {
      return next(new ErrorDTO(ErrorCodes.INPUT_ERROR, 'settings is needed'));
    }

    try {
      const settings = req.body.settings; // Top level settings JSON
      const settingsPath: string = req.body.settingsPath; // Name of the top level settings

      const original = await Config.original();
      // only updating explicitly set config (not saving config set by the diagnostics)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      original[settingsPath] = settings;
      await ConfigDiagnostics.testConfig(original);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Config[settingsPath] = settings;
      original.save();
      await ConfigDiagnostics.runDiagnostics();
      Logger.info(LOG_TAG, 'new config:');
      Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));
      return next();
    } catch (err) {
      if (err instanceof Error) {
        return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, 'Settings error: ' + err.toString(), err));
      }
      return next(new ErrorDTO(ErrorCodes.SETTINGS_ERROR, 'Settings error: ' + JSON.stringify(err, null, '  '), err));
    }
  }


}
