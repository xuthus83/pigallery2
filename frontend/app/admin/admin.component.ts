import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "../model/network/authentication.service";
import {Router} from "@angular/router";
import {UserRoles} from "../../../common/entities/UserDTO";
import {Config} from "../../../common/config/public/Config";
import {NotificationService} from "../model/notification.service";
import {NotificationType} from "../../../common/entities/NotificationDTO";
@Component({
  selector: 'admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  userManagementEnable: boolean = false;

  constructor(private _authService: AuthenticationService,
              private _router: Router,
              public notificationService: NotificationService) {
    this.userManagementEnable = Config.Client.authenticationRequired;
  }

  ngOnInit() {
    if (!this._authService.isAuthenticated()
      || this._authService.user.value.role < UserRoles.Admin) {
      this._router.navigate(['login']);
      return;
    }
  }

  public getCss(type: NotificationType) {
    switch (type) {
      case NotificationType.error:
        return "danger";
      case NotificationType.warning:
        return "warning";
      case NotificationType.info:
        return "info";
    }
    return "info";
  }

}



