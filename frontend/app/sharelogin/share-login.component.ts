import {Component, OnInit} from "@angular/core";
import {LoginCredential} from "../../../common/entities/LoginCredential";
import {AuthenticationService} from "../model/network/authentication.service";
import {Router} from "@angular/router";
import {ErrorCodes} from "../../../common/entities/Error";

@Component({
  selector: 'share-login',
  templateUrl: './share-login.component.html',
  styleUrls: ['./share-login.component.css'],
})
export class ShareLoginComponent implements OnInit {
  loginCredential: LoginCredential;
  loginError: any = null;

  constructor(private _authService: AuthenticationService, private _router: Router) {
    this.loginCredential = new LoginCredential();
  }

  ngOnInit() {
    if (this._authService.isAuthenticated()) {
      this._router.navigate(['gallery', "/"]);
    }
  }

  async onLogin() {
    this.loginError = null;

    try {
      await this._authService.login(this.loginCredential);

    } catch (error) {
      if (error && error.code === ErrorCodes.CREDENTIAL_NOT_FOUND) {
        this.loginError = "Wrong username or password";
      }
    }
  }
}

