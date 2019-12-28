import {AfterViewInit, Component, ElementRef, Inject, LOCALE_ID, OnInit, QueryList, ViewChildren} from '@angular/core';
import {AuthenticationService} from '../../model/network/authentication.service';
import {UserRoles} from '../../../../common/entities/UserDTO';
import {NotificationService} from '../../model/notification.service';
import {NotificationType} from '../../../../common/entities/NotificationDTO';
import {NavigationService} from '../../model/navigation.service';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {Config} from '../../../../common/config/public/Config';
import {ISettingsComponent} from '../settings/_abstract/ISettingsComponent';
import {PageHelper} from '../../model/page.helper';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, AfterViewInit {
  simplifiedMode = true;
  text = {
    Advanced: 'Advanced',
    Simplified: 'Simplified'
  };
  appVersion = Config.Client.appVersion;
  versionExtra = '';
  upTime = Config.Client.upTime;
  @ViewChildren('setting') settingsComponents: QueryList<ISettingsComponent>;
  @ViewChildren('setting', {read: ElementRef}) settingsComponents2: QueryList<ElementRef>;
  contents: ISettingsComponent[] = [];

  constructor(private _authService: AuthenticationService,
              private _navigation: NavigationService,
              public notificationService: NotificationService,
              @Inject(LOCALE_ID) private locale: string,
              public i18n: I18n) {
    this.text.Advanced = i18n('Advanced');
    this.text.Simplified = i18n('Simplified');

    if (Config.Client.buildTime) {
      this.versionExtra = i18n('Built at') + ': ' + formatDate(Config.Client.buildTime, 'medium', locale);
    }
    if (Config.Client.buildCommitHash) {
      this.versionExtra += ', ' + i18n('git hash') + ': ' + Config.Client.buildCommitHash;
    }

  }

  ngAfterViewInit(): void {
    setTimeout(() => this.contents = this.settingsComponents.toArray(), 0);
  }

  scrollTo(i: number) {
    PageHelper.ScrollY = this.settingsComponents2.toArray()[i].nativeElement.getBoundingClientRect().top +
        PageHelper.ScrollY;
  }

  ngOnInit() {
    if (!this._authService.isAuthenticated()
        || this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
  }


  public getCss(type: NotificationType) {
    switch (type) {
      case NotificationType.error:
        return 'danger';
      case NotificationType.warning:
        return 'warning';
      case NotificationType.info:
        return 'info';
    }
    return 'info';
  }

}



