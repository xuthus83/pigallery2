import { Component } from '@angular/core';
import { MetaFileSettingsService } from './metafile.settings.service';
import { SettingsComponentDirective } from '../_abstract/abstract.settings.component';
import { AuthenticationService } from '../../../model/network/authentication.service';
import { NavigationService } from '../../../model/navigation.service';
import { NotificationService } from '../../../model/notification.service';
import {ClientMetaFileConfig, ClientPhotoConfig} from '../../../../../common/config/public/ClientConfig';
import {ServerMetaFileConfig, ServerPhotoConfig} from '../../../../../common/config/private/PrivateConfig';

@Component({
  selector: 'app-settings-meta-file',
  templateUrl: './metafile.settings.component.html',
  styleUrls: [
    './metafile.settings.component.css',
    '../_abstract/abstract.settings.component.css',
  ],
  providers: [MetaFileSettingsService],
})
export class MetaFileSettingsComponent extends SettingsComponentDirective<{
  server: ServerMetaFileConfig;
  client: ClientMetaFileConfig;
}> {
  constructor(
    authService: AuthenticationService,
    navigation: NavigationService,
    settingsService: MetaFileSettingsService,
    notification: NotificationService
  ) {
    super(
      $localize`Meta file`,
      'file',
      authService,
      navigation,
      settingsService,
      notification,
      (s) => ({
        client: s.Client.MetaFile,
        server: s.Server.MetaFile,
      })
    );
  }
}



