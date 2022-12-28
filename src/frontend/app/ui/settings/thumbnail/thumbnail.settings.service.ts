import { Injectable } from '@angular/core';
import { NetworkService } from '../../../model/network/network.service';
import { AbstractSettingsService } from '../_abstract/abstract.settings.service';
import { SettingsService } from '../settings.service';
import { ServerThumbnailConfig } from '../../../../../common/config/private/PrivateConfig';

@Injectable()
export class ThumbnailSettingsService extends AbstractSettingsService<ServerThumbnailConfig> {
  constructor(
    private networkService: NetworkService,
    settingsService: SettingsService
  ) {
    super(settingsService);
  }

  hasAvailableSettings(): boolean {
    return false;
  }

  public updateSettings(settings: ServerThumbnailConfig): Promise<void> {
    return this.networkService.putJson('/settings/thumbnail', { settings });
  }
}
