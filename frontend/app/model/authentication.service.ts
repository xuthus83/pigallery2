///<reference path="../../../typings/tsd.d.ts"/>

import * as io  from 'socket.io-client';
import {Injectable} from 'angular2/core';
import {OnInit} from "angular2/core";
import {NetworkService} from "./network.service";
import {User} from "../../../common/entities/User";
import {Event} from "../../../common/event/Event";

@Injectable()
export class AuthenticationService{

    private _user:User;
    public OnAuthenticated:Event<User>;

    constructor(private _networkService: NetworkService){
        this.OnAuthenticated = new Event();
        this._networkService.OnAuthenticated.on(this.onAuthenticated);
    }


    private onAuthenticated = (user:User) => {
        this._user=user;
        this.OnAuthenticated.trigger(this._user);
    }


}
