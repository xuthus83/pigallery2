///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from 'angular2/core';
import {LoginCredential} from '../../../common/entities/LoginCredential';
import {AuthenticationService} from "../model/authentication.service";
import {Router} from "angular2/router";
import {MATERIAL_DIRECTIVES} from "ng2-material/all";
import {FORM_DIRECTIVES} from "angular2/common"; 
import {MATERIAL_BROWSER_PROVIDERS} from "ng2-material/all";
import {ViewportHelper} from "ng2-material/all";
 
@Component({
    selector: 'login',
    templateUrl: 'app/login/login.component.html',
    styleUrls:['app/login/login.component.css'],
    directives:[MATERIAL_DIRECTIVES,FORM_DIRECTIVES],
    providers:[MATERIAL_BROWSER_PROVIDERS, ViewportHelper]
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

