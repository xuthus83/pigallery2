import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {ClientConfig} from '../../../../../common/config/public/ClientConfig';
import {ServerConfig} from '../../../../../common/config/private/PrivateConfig';

@Injectable()
export class VideoSettingsService extends AbstractSettingsService<{ server: ServerConfig.VideoConfig, client: ClientConfig.VideoConfig }> {
  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);

  }

  public updateSettings(settings: { server: ServerConfig.VideoConfig, client: ClientConfig.VideoConfig }): Promise<void> {
    return this._networkService.putJson('/settings/video', {settings: settings});
  }

}
