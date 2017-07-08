import {Component, OnInit, ViewChild} from "@angular/core";
import {AuthenticationService} from "../../model/network/authentication.service";
import {Router} from "@angular/router";
import {UserDTO, UserRoles} from "../../../../common/entities/UserDTO";
import {Utils} from "../../../../common/Utils";
import {UserManagerSettingsService} from "./usermanager.settings.service";
import {ModalDirective} from "ngx-bootstrap/modal";

@Component({
  selector: 'settings-usermanager',
  templateUrl: './usermanager.settings.component.html',
  styleUrls: ['./usermanager.settings.component.css'],
  providers: [UserManagerSettingsService],
})
export class UserMangerSettingsComponent implements OnInit {
  @ViewChild('userModal') public childModal: ModalDirective;
  public newUser = <UserDTO>{};
  public userRoles: Array<any> = [];
  public users: Array<UserDTO> = [];

  constructor(private _authService: AuthenticationService, private _router: Router, private _userSettings: UserManagerSettingsService) {
  }

  ngOnInit() {
    if (!this._authService.isAuthenticated() || this._authService.user.value.role < UserRoles.Admin) {
      this._router.navigate(['login']);
      return;
    }
    this.userRoles = Utils
      .enumToArray(UserRoles)
      .filter(r => r.key <= this._authService.user.value.role)
      .sort((a, b) => a.key - b.key);

    this.getUsersList();
  }

  private async getUsersList() {
    this.users = await this._userSettings.getUsers();
  }


  canModifyUser(user: UserDTO): boolean {
    let currentUser = this._authService.user.value;
    if (!currentUser) {
      return false;
    }

    return currentUser.name != user.name && currentUser.role >= user.role;
  }

  initNewUser() {
    this.newUser = <UserDTO>{role: UserRoles.User};
    this.childModal.show();
  }

  async addNewUser() {
    await this._userSettings.createUser(this.newUser);
    await this.getUsersList();
    this.childModal.hide();
  }

  async updateRole(user: UserDTO) {
    await this._userSettings.updateRole(user);
    await this.getUsersList();
    this.childModal.hide();
  }

  async deleteUser(user: UserDTO) {
    await this._userSettings.deleteUser(user);
    await this.getUsersList();
    this.childModal.hide();
  }
}



