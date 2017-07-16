import {Component, OnInit} from "@angular/core";
import {LoginCredential} from "../../../common/entities/LoginCredential";
import {AuthenticationService} from "../model/network/authentication.service";
import {ErrorCodes} from "../../../common/entities/Error";
import {Config} from "../../../common/config/public/Config";
import {NavigationService} from "../model/navigation.service";

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginCredential: LoginCredential;
  loginError: any = null;
  title: string;

  constructor(private _authService: AuthenticationService, private _navigation: NavigationService) {
    this.loginCredential = new LoginCredential();
    this.title = Config.Client.applicationTitle;
  }

  ngOnInit() {
    if (this._authService.isAuthenticated()) {
      this._navigation.toGallery();
    }
  }

  async onLogin() {
    this.loginError = null;

    try {
      await this._authService.login(this.loginCredential);
    } catch (error) {
      if (error && error.code === ErrorCodes.CREDENTIAL_NOT_FOUND) {
        this.loginError = "Wrong username or password";
        return;
      }
    }
  }
}

