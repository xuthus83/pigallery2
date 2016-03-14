///<reference path="../browser.d.ts"/>

import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import {LoginComponent} from "./login/login.component";
import {NetworkService} from "./model/network.service";
import {LoginService} from "./login/login.service";
import {AuthenticationService} from "./model/authentication.service";
import {GalleryComponent} from "./gallery/gallery.component";
import {OnInit} from "angular2/core";
import {User} from "../../common/entities/User";
import {Router} from "angular2/router";




@Component({
    selector: 'pi-gallery2-app',
    template: `<router-outlet></router-outlet>`,
    directives: [ROUTER_DIRECTIVES],
    providers: [
        ROUTER_PROVIDERS,
        NetworkService,
        AuthenticationService,
        LoginService
    ]
})
@RouteConfig([
    {
        path: '/login',
        name: 'Login',
        component: LoginComponent,
        useAsDefault: true
    },
    {
        path: '/gallery',
        name: 'Gallery',
        component: GalleryComponent
    }
])
export class AppComponent  implements OnInit{

    constructor(private _router: Router ,private _authenticationService: AuthenticationService){
    }

    ngOnInit() {
        this._authenticationService.OnAuthenticated.on((user:User) =>
        {
            this._router.navigate(["Gallery"]);
        });
    }
}