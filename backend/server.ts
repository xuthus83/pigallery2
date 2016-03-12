///<reference path="../typings/tsd.d.ts"/>

import * as _express from 'express';
import * as _debug from 'debug';
import * as _http from 'http';
import * as path from 'path';


export class Server {

    private debug:any;
    private app:any;
    private server:any;
    private port:number;

    constructor(){

        this.debug = _debug("PiGallery2:server");
        this.app = _express();

        if(process.env.DEBUG) {
            var _morgan = require('morgan');
            this.app.use(_morgan('dev'));
        }


        this.app.use(_express.static(path.resolve(__dirname, './../frontend')));
        this.app.use('/node_modules',_express.static(path.resolve(__dirname, './../node_modules')));

        var renderIndex = (req: _express.Request, res: _express.Response) => {
            res.sendFile(path.resolve(__dirname, './../frontend/index.html'));
        };
        this.app.get('/*', renderIndex);



        // Get port from environment and store in Express.
        this.port = Server.normalizePort(process.env.PORT || '80');
        this.app.set('port', this.port);

        // Create HTTP server.
        this.server = _http.createServer(this.app);

        //Listen on provided port, on all network interfaces.
        this.server.listen(this.port);
        this.server.on('error', this.onError);
        this.server.on('listening', this.onListening);


    }


    /**
     * Normalize a port into a number, string, or false.
     */
    private static normalizePort(val) {
        var port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */
    private onError = (error) => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof this.port === 'string'
            ? 'Pipe ' + this.port
            : 'Port ' + this.port;

        // handle specific listen errors with friendly messages
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