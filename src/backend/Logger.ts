import * as winston from 'winston';
import {Config} from '../common/config/private/Config';
import {LogLevel} from '../common/config/private/PrivateConfig';

const forcedDebug = process.env.NODE_ENV === 'debug';

if (forcedDebug === true) {
  console.log('NODE_ENV environmental variable is set to debug, forcing all logs to print');
}
export const winstonSettings = {
  transports: [
    new winston.transports.Console({
      level: forcedDebug === true ? LogLevel[LogLevel.silly] : LogLevel[Config.Server.Log.level],
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp(): string {
        return (new Date()).toLocaleString();
      },
      label: 'innerLabel',
      formatter: (options: any) => {
        // Return string will be passed to logger.
        return options.timestamp() + '[' + (winston as any).config.colorize(options.level, options.level.toUpperCase()) + '] ' +
          (undefined !== options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '');
      },
      debugStdout: true
    } as any)
  ],
  exitOnError: false
};

export type logFN = (...args: (string | number)[]) => {};

export const Logger: {
  error: logFN,
  warn: logFN,
  info: logFN,
  verbose: logFN,
  debug: logFN,
  silly: logFN
} = new (winston as any).Logger(winstonSettings);
