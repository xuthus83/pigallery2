import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {ClientMetaFileConfig} from '../../../../../common/config/public/ClientConfig';
import {ServerMetaFileConfig} from '../../../../../common/config/private/PrivateConfig';

@Injectable()
export class MetaFileSettingsService extends AbstractSettingsService<ServerMetaFileConfig> {
  constructor(
    private networkService: NetworkService,
    settingsService: SettingsService
  ) {
    super(settingsService);
  }

  public isSupported(): boolean {
    return this.settingsService.settings.value.Map.enabled === true;
  }

  hasAvailableSettings(): boolean {
    return false;
  }

  public updateSettings(settings: ServerMetaFileConfig): Promise<void> {
    return this.networkService.putJson('/settings/metafile', {settings});
  }
}
