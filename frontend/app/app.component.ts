///<reference path="../browser.d.ts"/>

import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import {LoginComponent} from "./login/login.component";
import {AuthenticationService} from "./model/authentication.service";
import {GalleryComponent} from "./gallery/gallery.component";
import {OnInit} from "angular2/core";
import {User} from "../../common/entities/User";
import {Router, Location} from "angular2/router";
import {HTTP_PROVIDERS} from "angular2/http";
import {UserService} from "./model/user.service";




@Component({
    selector: 'pi-gallery2-app',
    template: `<router-outlet></router-outlet>`,
    directives: [ROUTER_DIRECTIVES],
    providers: [
        HTTP_PROVIDERS,
        ROUTER_PROVIDERS,
        UserService,
        AuthenticationService
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

    constructor(private _router: Router, private _location:Location, private _authenticationService: AuthenticationService){
    }

    ngOnInit() {
        this._authenticationService.OnAuthenticated.on((user:User) =>
        {
            this._location.replaceState('/'); // clears browser history so they can't navigate with back button
            this._router.navigate(["Gallery"]);
        });

    }
}