///<reference path="../../../typings/tsd.d.ts"/>

import * as io  from 'socket.io-client';
import {Injectable} from 'angular2/core';
import {OnInit} from "angular2/core";
import {LoginCredential} from "../../../common/entities/LoginCredential";
import {MessageTypes} from "../../../common/MessageTypes";
import {Event} from "../../../common/event/Event";
import {User} from "../../../common/entities/User";
import {Message} from "../../../common/entities/Message";

@Injectable()
export class NetworkService{

    private _socketIO: SocketIOClient.Socket;

    public OnAuthenticated:Event<User>;

    constructor(){
        this._socketIO = io();
        this.OnAuthenticated = new Event();
        this._subscribeMessages();
    }


    public login(credential:LoginCredential){
        this._socketIO.emit(MessageTypes.Client.Login.Authenticate,credential);
    }

    private _subscribeMessages(){
        this._socketIO.on(MessageTypes.Server.Login.Authenticated, (message:Message<User>) =>{
            if(message.error){
                //TODO: Handle error
            }else{
                this.OnAuthenticated.trigger(message.result);
            }
        });
    }
}
