import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthenticationService} from './model/network/authentication.service';
import {Router} from '@angular/router';
import {Config} from '../../common/config/public/Config';
import {Title} from '@angular/platform-browser';
import {ShareService} from './ui/gallery/share.service';
import 'hammerjs';
import {Subscription} from 'rxjs';
import {QueryParams} from '../../common/QueryParams';

@Component({
  selector: 'app-pi-gallery2',
  template: `
    <router-outlet></router-outlet>`
})
export class AppComponent implements OnInit, OnDestroy {

  private subscription: Subscription = null;

  constructor(private _router: Router,
              private _authenticationService: AuthenticationService,
              private _shareService: ShareService,
              private  _title: Title) {
  }

  async ngOnInit() {
    this._title.setTitle(Config.Client.applicationTitle);
    await this._shareService.wait();
    this.subscription = this._authenticationService.user.subscribe(() => {
      if (this._authenticationService.isAuthenticated()) {
        if (this.isLoginPage()) {
          return this.toGallery();
        }
      } else {
        if (!this.isLoginPage()) {
          return this.toLogin();
        }
      }

    });

  }

  ngOnDestroy() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
  }

  private isLoginPage() {
    return this._router.isActive('login', true) || this._router.isActive('shareLogin', false);
  }

  private toLogin() {
    if (this._shareService.isSharing()) {
      const q: any = {};
      q[QueryParams.gallery.sharingKey_query] = this._shareService.getSharingKey();
      return this._router.navigate(['shareLogin'], {queryParams: q});
    } else {
      return this._router.navigate(['login']);
    }
  }

  private toGallery() {
    if (this._shareService.isSharing()) {
      return this._router.navigate(['share', this._shareService.getSharingKey()]);
    } else {
      return this._router.navigate(['gallery', '']);
    }
  }
}
