///<reference path="../../../browser.d.ts"/>

import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "../../model/network/authentication.service.ts";
import {Router} from "@angular/router-deprecated";
import {FrameComponent} from "../../frame/frame.component";
import {User, UserRoles} from "../../../../common/entities/User";
import {FORM_DIRECTIVES} from "@angular/common";
import {Utils} from "../../../../common/Utils";
import {Message} from "../../../../common/entities/Message";
import {StringifyRole} from "./../../pipes/StringifyRolePipe";
import {UserManagerSettingsService} from "./usermanager.settings.service";

@Component({
    selector: 'settings-usermanager',
    templateUrl: 'app/settings/usermanager/usermanager.settings.component.html',
    styleUrls: ['app/settings/usermanager/usermanager.settings.component.css'],
    directives: [FrameComponent, FORM_DIRECTIVES],
    providers: [UserManagerSettingsService],
    pipes: [StringifyRole]
})
export class UserMangerSettingsComponent implements OnInit {

    private newUser = new User();
    private userRoles:Array<any> = [];
    private users:Array<User> = [];

    constructor(private _authService:AuthenticationService, private _router:Router, private _userSettings:UserManagerSettingsService) {
    }

    ngOnInit() {
        if (!this._authService.isAuthenticated() || this._authService.getUser().role < UserRoles.Admin) {
            this._router.navigate(['Login']);
            return;
        }
        this.userRoles = Utils.enumToArray(UserRoles).filter(r => r.key <= this._authService.getUser().role);
        this.getUsersList();
    }

    private getUsersList() {
        this._userSettings.getUsers().then((result:Message<Array<User>>) => {
            this.users = result.result;
        });
    }


    canModifyUser(user:User):boolean {
        let currentUser = this._authService.getUser();
        if (!currentUser) {
            return false;
        }

        return currentUser.name != user.name && currentUser.role >= user.role;
    }

    initNewUser() {
        this.newUser = new User();
        this.newUser.role = UserRoles.User;
    }

    addNewUser() {
        this._userSettings.createUser(this.newUser).then(() => {
            this.getUsersList();
        });
    }

    updateRole(user:User) {
        this._userSettings.updateRole(user).then(() => {
            this.getUsersList();
        });
    }

    deleteUser(user:User) {
        this._userSettings.deleteUser(user).then(() => {
            this.getUsersList();
        });
    }
}



