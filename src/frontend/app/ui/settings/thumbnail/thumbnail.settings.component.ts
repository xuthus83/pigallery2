import {Component, OnInit} from '@angular/core';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {ThumbnailSettingsService} from './thumbnail.settings.service';
import {Utils} from '../../../../../common/Utils';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';

@Component({
  selector: 'app-settings-thumbnail',
  templateUrl: './thumbnail.settings.component.html',
  styleUrls: ['./thumbnail.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [ThumbnailSettingsService],
})
export class ThumbnailSettingsComponent
    extends SettingsComponent<{ server: ServerConfig.ThumbnailConfig, client: ClientConfig.ThumbnailConfig }>
    implements OnInit {
  ThumbnailProcessingLib: any;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: ThumbnailSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Thumbnail'), _authService, _navigation, _settingsService, notification, i18n, s => ({
      client: s.Client.Media.Thumbnail,
      server: s.Server.Media.Thumbnail
    }));
  }

  get ThumbnailSizes(): string {
    return this.settings.client.thumbnailSizes.join('; ');
  }

  set ThumbnailSizes(value: string) {
    value = value.replace(new RegExp(',', 'g'), ';');
    value = value.replace(new RegExp(' ', 'g'), ';');
    this.settings.client.thumbnailSizes = value.split(';')
        .map(s => parseInt(s, 10))
        .filter(i => !isNaN(i) && i > 0);
  }

  ngOnInit() {
    super.ngOnInit();
  }



}



