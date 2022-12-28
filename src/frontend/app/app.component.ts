import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from './model/network/authentication.service';
import {Router} from '@angular/router';
import {Config} from '../../common/config/public/Config';
import {Title} from '@angular/platform-browser';
import {ShareService} from './ui/gallery/share.service';
import 'hammerjs';
import {Subscription} from 'rxjs';
import {NavigationService} from './model/navigation.service';

@Component({
  selector: 'app-pi-gallery2',
  template: `
    <router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit, OnDestroy {
  private subscription: Subscription = null;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private shareService: ShareService,
    private navigation: NavigationService,
    private title: Title
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.title.setTitle(Config.Server.applicationTitle);
    await this.shareService.wait();
    this.subscription = this.authenticationService.user.subscribe(() => {
      if (this.authenticationService.isAuthenticated()) {
        if (this.navigation.isLoginPage()) {
          return this.navigation.toDefault();
        }
      } else {
        if (!this.navigation.isLoginPage()) {
          return this.navigation.toLogin();
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
  }

}
