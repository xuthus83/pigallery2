import {BehaviorSubject} from 'rxjs';
import {SettingsService} from '../settings.service';
import {WebConfig} from '../../../../../common/config/private/WebConfig';
import {NetworkService} from '../../../model/network/network.service';
import {Injectable} from '@angular/core';

@Injectable()
export class AbstractSettingsService {
  constructor(public settingsService: SettingsService,
              private networkService: NetworkService) {
  }

  get Settings(): BehaviorSubject<WebConfig> {
    return this.settingsService.settings;
  }

  public getSettings(): Promise<void> {
    return this.settingsService.getSettings();
  }

  public updateSettings(settings: Record<string, any>, settingsPath: string): Promise<void> {
    return this.networkService.putJson('/settings', {settings, settingsPath});
  }
}
