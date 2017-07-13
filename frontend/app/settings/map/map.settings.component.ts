import {Component} from "@angular/core";
import {MapConfig} from "../../../../common/config/public/ConfigClass";
import {MapSettingsService} from "./map.settings.service";
import {SettingsComponent} from "../_abstract/abstract.settings.component";
import {AuthenticationService} from "../../model/network/authentication.service";
import {NavigationService} from "../../model/navigation.service";
import {NotificationService} from "../../model/notification.service";

@Component({
  selector: 'settings-map',
  templateUrl: './map.settings.component.html',
  styleUrls: ['./map.settings.component.css'],
  providers: [MapSettingsService],
})
export class MapSettingsComponent extends SettingsComponent<MapConfig> {
  public settings: MapConfig = <MapConfig> {
    enabled: true,
    googleApiKey: ""
  };

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsSettings: MapSettingsService,
              notification: NotificationService) {
    super("Map", _authService, _navigation, _settingsSettings, notification);
  }


}



