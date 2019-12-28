import * as _express from 'express';
import * as _bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as _http from 'http';
import {Server as HttpServer} from 'http';
// @ts-ignore
import * as locale from 'locale';
import {ObjectManagers} from './model/ObjectManagers';
import {Logger} from './Logger';
import {Config} from '../common/config/private/Config';
import {LoggerRouter} from './routes/LoggerRouter';
import {ThumbnailGeneratorMWs} from './middlewares/thumbnail/ThumbnailGeneratorMWs';
import {DiskManager} from './model/DiskManger';
import {ConfigDiagnostics} from './model/diagnostics/ConfigDiagnostics';
import {Localizations} from './model/Localizations';
import {CookieNames} from '../common/CookieNames';
import {Router} from './routes/Router';
import {ServerConfig} from '../common/config/private/IPrivateConfig';
import {PhotoProcessing} from './model/fileprocessing/PhotoProcessing';

const _session = require('cookie-session');

declare var process: NodeJS.Process;

const LOG_TAG = '[server]';

export class Server {

  private app: _express.Express;
  private server: HttpServer;

  constructor() {
    if (!(process.env.NODE_ENV === 'production')) {
      Logger.info(LOG_TAG, 'Running in DEBUG mode, set env variable NODE_ENV=production to disable ');
    }
    this.init().catch(console.error);
  }

  async init(): Promise<void> {
    Logger.info(LOG_TAG, 'running diagnostics...');
    await ConfigDiagnostics.runDiagnostics();
    Logger.verbose(LOG_TAG, 'using config:');
    Config.Client.appVersion = require('../../package.json').version;
    Config.Client.buildTime = require('../../package.json').buildTime;
    Config.Client.buildCommitHash = require('../../package.json').buildCommitHash;
    Config.Client.upTime = (new Date()).toISOString();
    Logger.verbose(LOG_TAG, JSON.stringify(Config, null, '\t'));

    this.app = _express();

    LoggerRouter.route(this.app);

    this.app.set('view engine', 'ejs');


    /**
     * Session above all
     */
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    this.app.use(_session({
      name: CookieNames.session,
      keys: ['key1' + s4() + s4() + s4() + s4(), 'key2' + s4() + s4() + s4() + s4(), 'key3' + s4() + s4() + s4() + s4()]
    }));


    /**
     * Parse parameters in POST
     */
    // for parsing application/json
    this.app.use(_bodyParser.json());
    this.app.use(cookieParser());

    DiskManager.init();
    PhotoProcessing.init();
    Localizations.init();

    this.app.use(locale(Config.Client.languages, 'en'));
    if (Config.Server.Database.type !== ServerConfig.DatabaseType.memory) {
      await ObjectManagers.InitSQLManagers();
    } else {
      await ObjectManagers.InitMemoryManagers();
    }

    Router.route(this.app);


    // Get PORT from environment and store in Express.
    this.app.set('port', Config.Server.port);

    // Create HTTP server.
    this.server = _http.createServer(this.app);

    // Listen on provided PORT, on all network interfaces.
    this.server.listen(Config.Server.port, Config.Server.host);
    this.server.on('error', this.onError);
    this.server.on('listening', this.onListening);


  }

  /**
   * Event listener for HTTP server "error" event.
   */
  private onError = (error: any) => {
    if (error.syscall !== 'listen') {
      Logger.error(LOG_TAG, 'Server error', error);
      throw error;
    }

    const bind = Config.Server.host + ':' + Config.Server.port;

    // handle specific listen error with friendly messages
    switch (error.code) {
      case 'EACCES':
        Logger.error(LOG_TAG, bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        Logger.error(LOG_TAG, bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  };

  /**
   * Event listener for HTTP server "listening" event.
   */
  private onListening = () => {
    const addr = this.server.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    Logger.info(LOG_TAG, 'Listening on ' + bind);
  };

}






