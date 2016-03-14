///<reference path="../../../typings/browser.d.ts"/>

import {Injectable} from 'angular2/core';
import {NetworkService} from "../model/network.service";
import {OnInit} from "angular2/core";
import {LoginCredential} from "../../../common/entities/LoginCredential";
import {User} from "../../../common/entities/User";
import {Message} from "../../../common/entities/Message";

@Injectable()
export class LoginService {

    constructor(private _networkService: NetworkService){
    }

    public login(credential:LoginCredential) {
        this._networkService.login(credential);
    }



}