import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {SettingsService} from '../settings.service';
import {ServerConfig} from '../../../../../common/config/private/PrivateConfig';

@Injectable()
export class DatabaseSettingsService extends AbstractSettingsService<ServerConfig.DataBaseConfig> {
  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
  }


  public updateSettings(settings: ServerConfig.DataBaseConfig): Promise<void> {
    return this._networkService.putJson('/settings/database', {settings: settings});
  }

}
