import {Injectable, ViewContainerRef} from "@angular/core";
import {ToastsManager} from "ng2-toastr/ng2-toastr";
import {NetworkService} from "./network/network.service";
import {AuthenticationService} from "./network/authentication.service";
import {NotificationDTO, NotificationType} from "../../../common/entities/NotificationDTO";
import {UserDTO} from "../../../common/entities/UserDTO";

@Injectable()
export class NotificationService {

  options = {
    positionClass: "toast-top-center",
    animate: "flyLeft"
  };
  notifications: NotificationDTO[] = [];
  lastUser: UserDTO = null;

  constructor(private _toastr: ToastsManager,
              private _networkService: NetworkService,
              private _authService: AuthenticationService) {

    this._authService.user.subscribe(() => {
      if (this._authService.isAuthenticated() &&
        (!this.lastUser ||
        this.lastUser.id != this._authService.user.value.id)) {
        this.getServerNotifications();
      }
      this.lastUser = this._authService.user.value;
    });
  }

  async getServerNotifications() {
    this.notifications = await this._networkService.getJson<NotificationDTO[]>("/notifications");
    this.notifications.forEach((noti) => {
      let msg = noti.message;
      if (noti.details) {
        msg += " Details: " + JSON.stringify(noti.details);
      }
      switch (noti.type) {
        case  NotificationType.error:
          this.error(msg, "Server error");
          break;
        case  NotificationType.warning:
          this.warning(msg, "Server error");
          break;
        case  NotificationType.info:
          this.info(msg, "Server info");
          break;
      }
    })
  }

  setRootViewContainerRef(vcr: ViewContainerRef) {
    this._toastr.setRootViewContainerRef(vcr);
  }

  success(text, title = null) {
    this._toastr.success(text, title, this.options);
  }

  error(text, title?) {
    this._toastr.error(text, title, this.options);
  }

  warning(text, title?) {
    this._toastr.warning(text, title, this.options);
  }

  info(text, title = null) {
    this._toastr.info(text, title, this.options);
  }


  get Toastr(): ToastsManager {
    return this._toastr;
  }
}
