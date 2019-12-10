import * as winston from 'winston';
import {Config} from '../common/config/private/Config';
import {ServerConfig} from '../common/config/private/IPrivateConfig';

export const winstonSettings = {
  transports: [
    new winston.transports.Console(<any>{
      level: ServerConfig.LogLevel[Config.Server.Log.level],
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: function () {
        return (new Date()).toLocaleString();
      },
      label: 'innerLabel',
      formatter: (options: any) => {
        // Return string will be passed to logger.
        return options.timestamp() + '[' + (<any>winston)['config']['colorize'](options.level, options.level.toUpperCase()) + '] ' +
          (undefined !== options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
      },
      debugStdout: true
    })
  ],
  exitOnError: false
};

type logFN = (...args: (string | number)[]) => {};

export const Logger: {
  error: logFN,
  warn: logFN,
  info: logFN,
  verbose: logFN,
  debug: logFN,
  silly: logFN
} = new (<any>winston).Logger(winstonSettings);
