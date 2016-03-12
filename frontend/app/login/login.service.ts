///<reference path="../../../typings/tsd.d.ts"/>

import {Injectable} from 'angular2/core';
import {NetworkService} from "../model/network.service";
import {OnInit} from "angular2/core";
import {MessageTypes} from "../../../common/MessageTypes";
import {Utils} from "../../../common/Utils";
import {LoginCredential} from "../../../common/entities/LoginCredential";
import {User} from "../../../common/entities/User";
import {Message} from "../../../common/entities/Message";

@Injectable()
export class LoginService  implements OnInit{

    private _authenticating:LoginCredential;
    constructor(private _networkService: NetworkService){

    }

    ngOnInit() {
        this._networkService.socketIO.on(MessageTypes.Server.Login.Authenticated, (message:Message<User>) => {
            if(message.result.name == this._authenticating.username || message.result.email == this._authenticating.username){

            }
        });
    }

    public login(user:LoginCredential):Promise<User> {
        this._networkService.socketIO.emit(MessageTypes.Client.Login.Authenticate, user);
        this._authenticating = Utils.clone(user);
    }



}