import { Injectable } from '@angular/core';
import { NetworkService } from '../../../model/network/network.service';
import { AbstractSettingsService } from '../_abstract/abstract.settings.service';
import { SettingsService } from '../settings.service';

@Injectable()
export class OtherSettingsService extends AbstractSettingsService<any> {
  constructor(
    private networkService: NetworkService,
    settingsService: SettingsService
  ) {
    super(settingsService);
  }

  public updateSettings(settings: any): Promise<void> {
    return this.networkService.putJson('/settings/other', { settings });
  }
}
