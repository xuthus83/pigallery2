import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '../settings.service';
import { WebConfig } from '../../../../../common/config/private/WebConfig';

export abstract class AbstractSettingsService<T> {
  protected constructor(public settingsService: SettingsService) {}

  get Settings(): BehaviorSubject<WebConfig> {
    return this.settingsService.settings;
  }

  public getSettings(): Promise<void> {
    return this.settingsService.getSettings();
  }


  abstract updateSettings(settings: T): Promise<void>;
}
