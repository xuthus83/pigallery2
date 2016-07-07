///<reference path="../../browser.d.ts"/>

import {Component, ViewEncapsulation} from "@angular/core";
import {RouterLink} from "@angular/router-deprecated";
import {AuthenticationService} from "../model/network/authentication.service";
import {User} from "../../../common/entities/User";
import {Config} from "../config/Config";

@Component({
    selector: 'app-frame',
    templateUrl: 'app/frame/frame.component.html',
    directives: [RouterLink],
    encapsulation: ViewEncapsulation.Emulated
})
export class FrameComponent {

    user:User;
    authenticationRequired:boolean = false;

    constructor(private _authService:AuthenticationService) {
        this.user = this._authService.getUser();
        this.authenticationRequired = Config.Client.authenticationRequired;
    }


    logout() {
        this._authService.logout();
    }
    
}

