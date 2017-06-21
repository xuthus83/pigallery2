import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "./model/network/authentication.service";
import {UserDTO} from "../../common/entities/UserDTO";
import {Router} from "@angular/router";


@Component({
  selector: 'pi-gallery2-app',
  template: `<router-outlet></router-outlet>`,

})
export class AppComponent implements OnInit {

  constructor(private _router: Router, private _authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this._authenticationService.OnUserChanged.on((user: UserDTO) => {
      if (user != null) {
        if (this._router.isActive('login', true)) {
          console.log("routing");
          this._router.navigate(["gallery", ""]);
        }
      } else {
        if (this._router.isActive('login', true)) {
          console.log("routing");
          this._router.navigate(["login"]);
        }
      }

    });


  }


}
