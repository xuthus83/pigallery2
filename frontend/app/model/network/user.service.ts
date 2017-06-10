import {Injectable} from "@angular/core";
import {LoginCredential} from "../../../../common/entities/LoginCredential";
import {NetworkService} from "./network.service";
import {UserDTO} from "../../../../common/entities/UserDTO";
import {Message} from "../../../../common/entities/Message";

@Injectable()
export class UserService {


  constructor(private _networkService: NetworkService) {
  }

  public logout(): Promise<Message<string>> {
    console.log("call logout");
    return this._networkService.postJson("/user/logout");
  }

  public login(credential: LoginCredential): Promise<Message<UserDTO>> {
    return this._networkService.postJson("/user/login", {"loginCredential": credential});
  }

  public getSessionUser(): Promise<Message<UserDTO>> {
    return this._networkService.getJson("/user/login");
  }

}
