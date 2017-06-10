import {Component, OnInit} from "@angular/core";
import {LoginCredential} from "../../../common/entities/LoginCredential";
import {AuthenticationService} from "../model/network/authentication.service";
import {Router} from "@angular/router";
import {Message} from "../../../common/entities/Message";
import {UserDTO} from "../../../common/entities/UserDTO";
import {ErrorCodes} from "../../../common/entities/Error";

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
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

  onLogin() {
    this.loginError = null;
    this._authService.login(this.loginCredential).then((message: Message<UserDTO>) => {
      if (message.error) {
        if (message.error.code === ErrorCodes.CREDENTIAL_NOT_FOUND) {
          this.loginError = "Wrong username or password";
        }
      }
    });
  }
}

