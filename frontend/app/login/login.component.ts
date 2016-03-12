///<reference path="../../../typings/tsd.d.ts"/>

import { Component, OnInit } from 'angular2/core';
import {LoginCredential} from '../../../common/entities/LoginCredential';
import {LoginService} from "./login.service";

@Component({
    selector: 'login',
    templateUrl: 'app/login/login.component.html',
    styleUrls: ['app/login/login.component.css']
})
export class LoginComponent{
    user: LoginCredential;
    constructor(private _loginService: LoginService) {
        this.user = new LoginCredential();
    }
}

