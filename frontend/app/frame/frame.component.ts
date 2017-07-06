import {Component, ViewEncapsulation} from "@angular/core";
import {RouterLink} from "@angular/router";
import {AuthenticationService} from "../model/network/authentication.service";
import {UserDTO} from "../../../common/entities/UserDTO";
import {Config} from "../../../common/config/public/Config";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.css'],
  providers: [RouterLink],
  encapsulation: ViewEncapsulation.Emulated
})
export class FrameComponent {

  user: BehaviorSubject<UserDTO>;
  authenticationRequired: boolean = false;
  public title: string;

  constructor(private _authService: AuthenticationService) {
    this.user = this._authService.user;
    this.authenticationRequired = Config.Client.authenticationRequired;
    this.title = Config.Client.applicationTitle;
  }


  logout() {
    this._authService.logout();
  }

}

