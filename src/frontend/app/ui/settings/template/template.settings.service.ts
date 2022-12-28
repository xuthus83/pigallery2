import { Injectable } from '@angular/core';
import { NetworkService } from '../../../model/network/network.service';
import { SettingsService } from '../settings.service';
import { AbstractSettingsService } from '../_abstract/abstract.settings.service';
import { ClientMapConfig } from '../../../../../common/config/public/ClientConfig';

@Injectable()
export class TemplateSettingsService extends AbstractSettingsService<any> {
  constructor(
    private networkService: NetworkService,
    settingsService: SettingsService
  ) {
    super(settingsService);
  }

  hasAvailableSettings(): boolean {
    return true;
  }

  public updateSettings(settings: ClientMapConfig): Promise<void> {
    return this.networkService.putJson('/settings', { settings });
  }
}
