///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from 'angular2/core';
import {LoginCredential} from '../../../common/entities/LoginCredential';
import {AuthenticationService} from "../model/network/authentication.service.ts";
import {Router} from "angular2/router"; 
import {FORM_DIRECTIVES} from "angular2/common";  
 
@Component({
    selector: 'login',
    templateUrl: 'app/login/login.component.html',
    styleUrls:['app/login/login.component.css'],
    directives:[FORM_DIRECTIVES]
})
export class LoginComponent implements OnInit{
    loginCredential: LoginCredential;
    constructor(private _authService: AuthenticationService, private _router: Router) {
        this.loginCredential = new LoginCredential();
    }

    ngOnInit(){
        if (this._authService.isAuthenticated()) {
            this._router.navigate(['Gallery']);
        }
    }

    onLogin(){ 
        this._authService.login(this.loginCredential);
    }
}

