import {Component, OnInit, ViewContainerRef} from "@angular/core";
import {AuthenticationService} from "./model/network/authentication.service";
import {UserDTO} from "../../common/entities/UserDTO";
import {Router} from "@angular/router";
import {Config} from "../../common/config/public/Config";
import {Title} from "@angular/platform-browser";
import {NotificationService} from "./model/notification.service";


@Component({
  selector: 'pi-gallery2-app',
  template: `<router-outlet></router-outlet>`,

})
export class AppComponent implements OnInit {

  constructor(private _router: Router,
              private _authenticationService: AuthenticationService,
              private  _title: Title, vcr: ViewContainerRef,
              notificatin: NotificationService) {
    notificatin.setRootViewContainerRef(vcr);
  }

  ngOnInit() {
    this._title.setTitle(Config.Client.applicationTitle);
    this._authenticationService.user.subscribe((user: UserDTO) => {
      if (user != null) {
        if (this._router.isActive('login', true)) {
          console.log("routing");
          this._router.navigate(["gallery", ""]);
        }
      } else {
        if (!this._router.isActive('login', true)) {
          console.log("routing");
          this._router.navigate(["login"]);
        }
      }

    });


  }


}
