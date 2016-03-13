///<reference path="../typings/tsd.d.ts"/>


import * as _socketIo from 'socket.io';
import {MessageTypes} from "../common/MessageTypes";
import {User} from "../common/entities/User";
import {LoginCredential} from "../common/entities/LoginCredential";

import * as _debug from 'debug';
var debug = _debug("PiGallery2:NetworkManager");

export class NetworkManager{
    private socketIo:SocketIO.Server;

    constructor(http){

        this.socketIo = _socketIo(http);

        this.socketIo.on('connection', function(socket:SocketIO.Server){
            debug("Client Connected");
            socket.on(MessageTypes.Client.Login.Authenticate,(credential:LoginCredential) =>{
                debug("Message: " + MessageTypes.Client.Login.Authenticate);
                socket.emit(MessageTypes.Server.Login.Authenticated,new User("Dummy user","dummy@mail.com","password"));
            });
        });
    }
}