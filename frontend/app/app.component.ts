///<reference path="../browser.d.ts"/>

import {Component, OnInit} from "@angular/core";
import {LoginComponent} from "./login/login.component";
import {AuthenticationService} from "./model/network/authentication.service.ts";
import {GalleryComponent} from "./gallery/gallery.component";
import {User} from "../../common/entities/User";
import {Router, RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from "@angular/router-deprecated";
import {HTTP_PROVIDERS} from "@angular/http";
import {UserService} from "./model/network/user.service.ts";
import {GalleryService} from "./gallery/gallery.service";
import {AdminComponent} from "./admin/admin.component";
import {NetworkService} from "./model/network/network.service";
import {ThumbnailLoaderService} from "./gallery/grid/thumnailLoader.service";
import {GalleryCacheService} from "./gallery/cache.gallery.service";


@Component({
    selector: 'pi-gallery2-app',
    template: `<router-outlet></router-outlet>`,
    directives: [ROUTER_DIRECTIVES],
    providers: [
        HTTP_PROVIDERS,
        ROUTER_PROVIDERS,
        NetworkService,
        UserService,
        GalleryCacheService,
        GalleryService,
        AuthenticationService,
        ThumbnailLoaderService]
})
@RouteConfig([
    {
        path: '/',
        redirectTo: ["Login"]
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginComponent,
        useAsDefault: true
    },
    {
        path: '/admin',
        name: 'Admin',
        component: AdminComponent
    },
    {
        path: '/gallery',
        redirectTo: ["Gallery", {directory: ""}]
    },
    {
        path: '/gallery/:directory',
        name: 'Gallery',
        component: GalleryComponent
    },
    {
        path: '/search/:searchText',
        name: 'Search',
        component: GalleryComponent
    },
])
export class AppComponent implements OnInit {

    constructor(private _router:Router, private _authenticationService:AuthenticationService) {
    }

    ngOnInit() {
        this._authenticationService.OnUserChanged.on((user:User) => {
            if (user != null) {
                if (this._router.isRouteActive(this._router.generate(['Login']))) {
                    console.log("routing");
                    this._router.navigate(["Gallery", {directory: ""}]);
                }
            } else {
                if (!this._router.isRouteActive(this._router.generate(['Login']))) {
                    console.log("routing");
                    this._router.navigate(["Login"]);
                }
            }

        });


    }
}