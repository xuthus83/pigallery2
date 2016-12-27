import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "../../model/network/authentication.service";
import {Router} from "@angular/router";
import {UserDTO, UserRoles} from "../../../../common/entities/UserDTO";
import {Utils} from "../../../../common/Utils";
import {Message} from "../../../../common/entities/Message";
import {UserManagerSettingsService} from "./usermanager.settings.service";

@Component({
    selector: 'settings-usermanager',
    templateUrl: 'app/settings/usermanager/usermanager.settings.component.html',
    styleUrls: ['app/settings/usermanager/usermanager.settings.component.css'],
    providers: [UserManagerSettingsService],
})
export class UserMangerSettingsComponent implements OnInit {

    private newUser = <UserDTO>{};
    private userRoles: Array<any> = [];
    private users: Array<UserDTO> = [];

    constructor(private _authService: AuthenticationService, private _router: Router, private _userSettings: UserManagerSettingsService) {
    }

    ngOnInit() {
        if (!this._authService.isAuthenticated() || this._authService.getUser().role < UserRoles.Admin) {
            this._router.navigate(['login']);
            return;
        }
        this.userRoles = Utils.enumToArray(UserRoles).filter(r => r.key <= this._authService.getUser().role);
        this.getUsersList();
    }

    private getUsersList() {
        this._userSettings.getUsers().then((result: Message<Array<UserDTO>>) => {
            this.users = result.result;
        });
    }


    canModifyUser(user: UserDTO): boolean {
        let currentUser = this._authService.getUser();
        if (!currentUser) {
            return false;
        }

        return currentUser.name != user.name && currentUser.role >= user.role;
    }

    initNewUser() {
        this.newUser = <UserDTO>{role: UserRoles.User};
    }

    addNewUser() {
        this._userSettings.createUser(this.newUser).then(() => {
            this.getUsersList();
        });
    }

    updateRole(user: UserDTO) {
        this._userSettings.updateRole(user).then(() => {
            this.getUsersList();
        });
    }

    deleteUser(user: UserDTO) {
        this._userSettings.deleteUser(user).then(() => {
            this.getUsersList();
        });
    }
}



