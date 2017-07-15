import {Component} from "@angular/core";
import {SettingsComponent} from "../_abstract/abstract.settings.component";
import {AuthenticationService} from "../../model/network/authentication.service";
import {NavigationService} from "../../model/navigation.service";
import {NotificationService} from "../../model/notification.service";
import {ClientConfig} from "../../../../common/config/public/ConfigClass";
import {ShareSettingsService} from "./share.settings.service";

@Component({
  selector: 'settings-share',
  templateUrl: './share.settings.component.html',
  styleUrls: ['./share.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [ShareSettingsService],
})
export class ShareSettingsComponent extends SettingsComponent<ClientConfig.SharingConfig> {

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: ShareSettingsService,
              notification: NotificationService) {
    super("Share", _authService, _navigation, _settingsService, notification, s => s.Client.Sharing);
  }


}



