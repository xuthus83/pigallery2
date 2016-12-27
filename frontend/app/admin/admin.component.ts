import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "../model/network/authentication.service";
import {Router} from "@angular/router";
import {UserRoles} from "../../../common/entities/UserDTO";
import {Config} from "../config/Config";
@Component({
    selector: 'admin',
    templateUrl: 'app/admin/admin.component.html',
    styleUrls: ['app/admin/admin.component.css']
})
export class AdminComponent implements OnInit {
    userManagementEnable: boolean = false;

    constructor(private _authService: AuthenticationService, private _router: Router) {
        this.userManagementEnable = Config.Client.authenticationRequired;
    }

    ngOnInit() {
        if (!this._authService.isAuthenticated() || this._authService.getUser().role < UserRoles.Admin) {
            this._router.navigate(['login']);
            return;
        }
    }

}



