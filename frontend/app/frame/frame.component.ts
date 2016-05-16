///<reference path="../../browser.d.ts"/>

import {Component, ViewEncapsulation} from "@angular/core";
import {RouterLink} from "@angular/router-deprecated";
import {AuthenticationService} from "../model/network/authentication.service";
import {User} from "../../../common/entities/User";

@Component({
    selector: 'app-frame',
    templateUrl: 'app/frame/frame.component.html',
    directives: [RouterLink],
    encapsulation: ViewEncapsulation.Emulated
})
export class FrameComponent {

    user:User;

    constructor(private _authService:AuthenticationService) {
        this.user = this._authService.getUser();
    }

    logout() {
        this._authService.logout();
    }
    
}

