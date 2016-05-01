///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from "angular2/core";
import {AuthenticationService} from "../model/network/authentication.service.ts";
import {Router} from "angular2/router";
import {FrameComponent} from "../frame/frame.component";
import {User, UserRoles} from "../../../common/entities/User";
import {FORM_DIRECTIVES} from "angular2/common";
import {Utils} from "../../../common/Utils";
import {AdminService} from "./admin.service";

@Component({
    selector: 'admin',
    templateUrl: 'app/admin/admin.component.html',
    styleUrls: ['app/admin/admin.component.css'],
    directives: [FrameComponent, FORM_DIRECTIVES],
    providers: [AdminService]
})
export class AdminComponent implements OnInit {

    private newUser = new User();
    private userRoles:Array<any>;

    constructor(private _authService:AuthenticationService, private _router:Router, private _adminService:AdminService) {
        this.userRoles = Utils.enumToArray(UserRoles);
    }

    ngOnInit() {
        if (!this._authService.isAuthenticated() || this._authService.getUser().role < UserRoles.Admin) {
            this._router.navigate(['Login']);
            return;
        }
    }

    initNewUser() { 
        this.newUser = new User();
        this.newUser.role = UserRoles.User; 
    }

    addNewUser(){
        this._adminService.createUser(this.newUser);
    }
}

