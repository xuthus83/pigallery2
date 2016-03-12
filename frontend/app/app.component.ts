///<reference path="../../typings/tsd.d.ts"/>

import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';
import {LoginComponent} from "./login/login.component";
import {NetworkService} from "./model/network.service";
import {LoginService} from "./login/login.service";




@Component({
    selector: 'pi-gallery2-app',
    template: `<router-outlet></router-outlet>`,
    directives: [ROUTER_DIRECTIVES],
    providers: [
        ROUTER_PROVIDERS,
        NetworkService,
        LoginService
    ]
})
@RouteConfig([
    {
        path: '/login',
        name: 'Login',
        component: LoginComponent,
        useAsDefault: true
    }
])
export class AppComponent {
    constructor(){

    }
}