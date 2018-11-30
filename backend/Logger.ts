import * as winston from 'winston';

export const winstonSettings = {
  transports: [
    new winston.transports.Console(<any>{
      level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
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

export const Logger = new (<any>winston).Logger(winstonSettings);
