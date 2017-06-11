import * as _express from "express";
import * as _session from "express-session";
import * as _bodyParser from "body-parser";
import * as _http from "http";
import * as winston from "winston";
import * as expressWinston from "express-winston";
import {PublicRouter} from "./routes/PublicRouter";
import {UserRouter} from "./routes/UserRouter";
import {GalleryRouter} from "./routes/GalleryRouter";
import {AdminRouter} from "./routes/AdminRouter";
import {ErrorRouter} from "./routes/ErrorRouter";
import {SharingRouter} from "./routes/SharingRouter";
import {ObjectManagerRepository} from "./model/ObjectManagerRepository";
import {Logger} from "./Logger";
import {Config} from "../common/config/private/Config";
import {DatabaseType, ThumbnailProcessingLib} from "../common/config/private/IPrivateConfig";

const LOG_TAG = "[server]";
export class Server {

  private debug: any;
  private app: any;
  private server: any;

  constructor() {
    this.init();
  }

  async init() {
    Logger.info(LOG_TAG, "config:");
    Logger.info(LOG_TAG, JSON.stringify(Config, null, '\t'));

    this.app = _express();

    this.app.use(expressWinston.logger({
      transports: [
        new winston.transports.Console({
          level: 'silly',
          json: false,
          colorize: true,
          timestamp: function () {
            return (new Date()).toLocaleString();
          },
          formatter: (options) => {
            // Return string will be passed to logger.
            return options.timestamp() + '[' + winston['config']['colorize'](options.level, options.level.toUpperCase()) + '] ' +
              (undefined !== options.message ? options.message : '') +
              (options.meta && Object.keys(options.meta).length ? '\n\t' + JSON.stringify(options.meta) : '' );
          },
          debugStdout: true
        })
      ],
      meta: false, // optional: control whether you want to log the meta data about the request (default to true)
      msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
      expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
      colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
      level: (req) => {
        if (req.url.indexOf("/api/") !== -1) {
          return "verbose";
        }
        return req.url.indexOf("node_modules") !== -1 ? "silly" : "debug"
      }
    }));

    this.app.set('view engine', 'ejs');


    /**
     * Session above all
     */
    this.app.use(_session({
      name: "pigallery2-session",
      secret: 'PiGallery2 secret',
      cookie: {
        maxAge: 60000 * 10,
        httpOnly: false
      },
      resave: true,
      saveUninitialized: false
    }));

    /**
     * Parse parameters in POST
     */
    // for parsing application/json
    this.app.use(_bodyParser.json());

    if (Config.Server.database.type == DatabaseType.mysql) {
      try {
        await ObjectManagerRepository.InitMySQLManagers();
      } catch (err) {
        Logger.warn(LOG_TAG, "[MYSQL error]", err);
        Logger.warn(LOG_TAG, "Error during initializing mysql falling back to memory DB");
        Config.setDatabaseType(DatabaseType.memory);
        await ObjectManagerRepository.InitMemoryManagers();
      }
    } else {
      await ObjectManagerRepository.InitMemoryManagers();
    }

    if (Config.Server.thumbnail.processingLibrary == ThumbnailProcessingLib.sharp) {
      try {
        const sharp = require("sharp");
        sharp();

      } catch (err) {
        Logger.warn(LOG_TAG, "[Thumbnail hardware acceleration] sharp module error: ", err);

        Logger.warn(LOG_TAG, "Thumbnail hardware acceleration is not possible." +
          " 'Sharp' node module is not found." +
          " Falling back to JS based thumbnail generation");
        Config.Server.thumbnail.processingLibrary = ThumbnailProcessingLib.Jimp;
      }
    }


    if (Config.Server.thumbnail.processingLibrary == ThumbnailProcessingLib.gm) {
      try {
        const gm = require("gm");
        gm(1, 1).stream((err) => {
          Logger.warn(LOG_TAG, "[Thumbnail hardware acceleration] gm module error: ", err);
          Logger.warn(LOG_TAG, "Thumbnail hardware acceleration is not possible." +
            " 'gm' node module is not found." +
            " Falling back to JS based thumbnail generation");
          Config.Server.thumbnail.processingLibrary = ThumbnailProcessingLib.Jimp;
        });

      } catch (err) {
        Logger.warn(LOG_TAG, "[Thumbnail hardware acceleration] gm module error: ", err);

        Logger.warn(LOG_TAG, "Thumbnail hardware acceleration is not possible." +
          " 'gm' node module is not found." +
          " Falling back to JS based thumbnail generation");
        Config.Server.thumbnail.processingLibrary = ThumbnailProcessingLib.Jimp;
      }
    }

    PublicRouter.route(this.app);

    UserRouter.route(this.app);
    GalleryRouter.route(this.app);
    SharingRouter.route(this.app);
    AdminRouter.route(this.app);

    ErrorRouter.route(this.app);


    // Get PORT from environment and store in Express.
    this.app.set('port', Config.Server.port);

    // Create HTTP server.
    this.server = _http.createServer(this.app);

    //Listen on provided PORT, on all network interfaces.
    this.server.listen(Config.Server.port);
    this.server.on('error', this.onError);
    this.server.on('listening', this.onListening);


  }


  /**
   * Event listener for HTTP server "error" event.
   */
  private onError = (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof Config.Server.port === 'string'
      ? 'Pipe ' + Config.Server.port
      : 'Port ' + Config.Server.port;

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
    let addr = this.server.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    Logger.info(LOG_TAG, 'Listening on ' + bind);
  };

}


if (process.env.DEBUG) {
  Logger.debug(LOG_TAG, "Running in DEBUG mode");
}

new Server();
