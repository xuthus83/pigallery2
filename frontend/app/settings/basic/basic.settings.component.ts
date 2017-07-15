import {Component} from "@angular/core";
import {SettingsComponent} from "../_abstract/abstract.settings.component";
import {AuthenticationService} from "../../model/network/authentication.service";
import {NavigationService} from "../../model/navigation.service";
import {NotificationService} from "../../model/notification.service";
import {BasicSettingsService} from "./basic.settings.service";
import {BasicConfigDTO} from "../../../../common/entities/settings/BasicConfigDTO";

@Component({
  selector: 'settings-basic',
  templateUrl: './basic.settings.component.html',
  styleUrls: ['./basic.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [BasicSettingsService],
})
export class BasicSettingsComponent extends SettingsComponent<BasicConfigDTO> {

  urlPlaceholder = location.origin;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: BasicSettingsService,
              notification: NotificationService) {
    super("Basic", _authService, _navigation, _settingsService, notification);
  }

}



