import {Component} from '@angular/core';
import {MapSettingsService} from './map.settings.service';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {Utils} from '../../../../../common/Utils';
import {ClientConfig} from '../../../../../common/config/public/ClientConfig';


@Component({
  selector: 'app-settings-map',
  templateUrl: './map.settings.component.html',
  styleUrls: ['./map.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [MapSettingsService],
})
export class MapSettingsComponent extends SettingsComponent<ClientConfig.MapConfig> {

  public mapProviders: { key: number, value: string }[] = [];
  public MapProviders = ClientConfig.MapProviders;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: MapSettingsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Map'), _authService, _navigation, _settingsService, notification, i18n, s => s.Client.Map);

    this.mapProviders = Utils.enumToArray(ClientConfig.MapProviders);
  }


  addNewLayer() {
    this.states.customLayers.value.push({
      name: 'Layer-' + this.states.customLayers.value.length,
      url: ''
    });
  }

  removeLayer(layer: ClientConfig.MapLayers) {
    this.states.customLayers.value.splice(this.states.customLayers.value.indexOf(layer), 1);
  }
}



