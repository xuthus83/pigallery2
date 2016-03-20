///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from 'angular2/core';
import {LoginCredential} from '../../../common/entities/LoginCredential';
import {AuthenticationService} from "../model/authentication.service";
import {Router, Location} from "angular2/router";

@Component({
    selector: 'login',
    templateUrl: 'app/login/login.component.html',
    styleUrls: ['app/login/login.component.css']
})
export class LoginComponent implements OnInit{
    loginCredential: LoginCredential;
    constructor(private _authService: AuthenticationService, private _router: Router, private _location:Location) {
        this.loginCredential = new LoginCredential();
    }

    ngOnInit(){
        if (this._authService.isAuthenticated()) {
            this._location.replaceState('/'); // clears browser history so they can't navigate with back button
            this._router.navigate(['Gallery']);
        }
    }

    onLogin(){ 
        this._authService.login(this.loginCredential);
    }
}

