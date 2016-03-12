///<reference path="../../../typings/tsd.d.ts"/>

import { Component, OnInit } from 'angular2/core';
import {User} from '../../../common/enities/User';

@Component({
    selector: 'login',
    templateUrl: 'app/login/login.component.html',
    styleUrls: ['app/login/login.component.css']
})
export class LoginComponent{
    user:User;
    constructor() {
        this.user = new User();
    }
}

