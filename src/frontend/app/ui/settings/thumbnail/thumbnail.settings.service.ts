import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {SettingsService} from '../settings.service';
import {ServerConfig} from '../../../../../common/config/private/PrivateConfig';
import {ClientConfig} from '../../../../../common/config/public/ClientConfig';

@Injectable()
export class ThumbnailSettingsService
  extends AbstractSettingsService<{ server: ServerConfig.ThumbnailConfig, client: ClientConfig.ThumbnailConfig }> {
  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
  }


  showInSimplifiedMode(): boolean {
    return false;
  }

  public updateSettings(settings: { server: ServerConfig.ThumbnailConfig, client: ClientConfig.ThumbnailConfig }): Promise<void> {
    return this._networkService.putJson('/settings/thumbnail', {settings: settings});
  }

}
