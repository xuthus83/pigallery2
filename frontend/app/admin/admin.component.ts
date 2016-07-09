///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "../model/network/authentication.service.ts";
import {Router} from "@angular/router-deprecated";
import {FrameComponent} from "../frame/frame.component";
import {UserRoles} from "../../../common/entities/User";
import {FORM_DIRECTIVES} from "@angular/common";
import {StringifyRole} from "./../pipes/StringifyRolePipe";
import {Config} from "../config/Config";
import {UserMangerSettingsComponent} from "../settings/usermanager/usermanager.settings.component";

@Component({
    selector: 'admin',
    templateUrl: 'app/admin/admin.component.html',
    styleUrls: ['app/admin/admin.component.css'],
    directives: [FrameComponent, FORM_DIRECTIVES, UserMangerSettingsComponent],
    pipes: [StringifyRole]
})
export class AdminComponent implements OnInit {
    userManagementEnable:boolean = false;

    constructor(private _authService:AuthenticationService, private _router:Router) {
        this.userManagementEnable = Config.Client.authenticationRequired;
    }

    ngOnInit() {
        if (!this._authService.isAuthenticated() || this._authService.getUser().role < UserRoles.Admin) {
            this._router.navigate(['Login']);
            return;
        }
    }

}



