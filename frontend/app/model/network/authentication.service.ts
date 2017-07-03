import {Injectable} from "@angular/core";
import {UserDTO, UserRoles} from "../../../../common/entities/UserDTO";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {UserService} from "./user.service";
import {LoginCredential} from "../../../../common/entities/LoginCredential";
import {Cookie} from "ng2-cookies";
import {ErrorCodes} from "../../../../common/entities/Error";
import {Config} from "../../../../common/config/public/Config";

declare module ServerInject {
  export let user: UserDTO;
}

@Injectable()
export class AuthenticationService {

  public user: BehaviorSubject<UserDTO>;

  constructor(private _userService: UserService) {
    this.user = new BehaviorSubject(null);

    //picking up session..
    if (this.isAuthenticated() == false && Cookie.get('pigallery2-session') != null) {
      if (typeof ServerInject !== "undefined" && typeof ServerInject.user !== "undefined") {
        this.user.next(ServerInject.user);
      }
      this.getSessionUser();
    } else {
      if (Config.Client.authenticationRequired === false) {
        this.user.next(<UserDTO>{name: "", password: "", role: UserRoles.Admin});
      }
    }

  }

  private async getSessionUser(): Promise<void> {
    try {
      this.user.next(await this._userService.getSessionUser());
    } catch (error) {
      console.log(error);
    }

  }


  public async login(credential: LoginCredential): Promise<UserDTO> {
    try {
      const user = await this._userService.login(credential);
      this.user.next(user);
      return user;
    } catch (error) {
      if (typeof error.code !== "undefined") {
        console.log(ErrorCodes[error.code] + ", message: ", error.message);
      }
    }
  }


  public isAuthenticated(): boolean {
    if (Config.Client.authenticationRequired === false) {
      return true;
    }
    return !!(this.user.value && this.user.value != null);
  }



  public logout() {
    this._userService.logout();
    this.user.next(null);
  }


}
