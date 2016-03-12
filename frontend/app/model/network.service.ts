///<reference path="../../../typings/tsd.d.ts"/>

import * as io  from 'socket.io-client';
import {Injectable} from 'angular2/core';
import {OnInit} from "angular2/core";

@Injectable()
export class NetworkService implements OnInit{

    private _socketIO: SocketIOClient.Socket;

    ngOnInit() {
        this._socketIO = io();
    }


    get socketIO():SocketIOClient.Socket {
        return this._socketIO;
    }
}
