///<reference path="../typings/main.d.ts"/>

import * as _express from 'express';
import * as _session from 'express-session';
import * as _bodyParser from 'body-parser';
import * as _debug from 'debug';
import * as _http from 'http';
import {PublicRouter} from "./routes/PublicRouter";
import {UserRouter} from "./routes/UserRouter";
import {GalleryRouter} from "./routes/GalleryRouter";
import {AdminRouter} from "./routes/AdminRouter"; 
import {ErrorRouter} from "./routes/ErrorRouter";
import {SharingRouter} from "./routes/SharingRouter";
import {Config, DatabaseType} from "./config/Config";
import {ObjectManagerRepository} from "./model/ObjectManagerRepository";
import {MongoGalleryManager} from "./model/mongoose/MongoGalleryManager";
import {MongoUserManager} from "./model/mongoose/MongoUserManager";
import {DatabaseManager} from "./model/mongoose/DatabaseManager";


export class Server {

    private debug:any;
    private app:any;
    private server:any;
    private port:number;

    constructor(){

        this.debug = _debug("PiGallery2:server");
        this.app = _express();

        this.app.set('view engine', 'ejs');

        if(process.env.DEBUG) {
            var _morgan = require('morgan');
            this.app.use(_morgan('dev'));
        }

        /**
         * Session above all
         */
        this.app.use(_session({
            name:"pigallery2-session",
            secret: 'PiGallery2 secret',
            cookie: {
                maxAge: 60000*10,
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


        if(Config.databaseType === DatabaseType.memory){
            ObjectManagerRepository.MemoryMongoManagers();
        }else {
            if (DatabaseManager.getInstance(()=>{
                    console.error("MongoDB connection error. Falling back to memory Object Managers");
                    ObjectManagerRepository.MemoryMongoManagers();
                }).isConnectionError()) {
                console.error("MongoDB connection error. Falling back to memory Object Managers");
                ObjectManagerRepository.MemoryMongoManagers();
            } else {
                ObjectManagerRepository.InitMongoManagers();
            }
        }

        new PublicRouter(this.app);
        
        new UserRouter(this.app);
        new GalleryRouter(this.app);
        new SharingRouter(this.app);
        new AdminRouter(this.app);
        
        new ErrorRouter(this.app);

    


        // Get PORT from environment and store in Express.
        this.app.set('port', Config.PORT);

        // Create HTTP server.
        this.server = _http.createServer(this.app);

        //Listen on provided PORT, on all network interfaces.
        this.server.listen(Config.PORT);
        this.server.on('error', this.onError);
        this.server.on('listening', this.onListening);


    }


    

    /**
     * Event listener for HTTP server "error" event.
     */
    private onError = (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof Config.PORT === 'string'
            ? 'Pipe ' + Config.PORT
            : 'Port ' + Config.PORT;

        // handle specific listen error with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
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
        var addr = this.server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        this.debug('Listening on ' + bind);
    };

}



if(process.env.DEBUG) {
    console.log("Running in DEBUG mode");
}

new Server();