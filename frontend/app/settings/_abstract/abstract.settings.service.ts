import {Utils} from "../../../../common/Utils";
import {SettingsService} from "../settings.service";
import {IPrivateConfig} from "../../../../common/config/private/IPrivateConfig";
export abstract class AbstractSettingsService<T> {
  public settings: T = <any>{};
  public original: T = <any>{};

  constructor(protected _settingsService: SettingsService, private sliceFN: (s: IPrivateConfig) => T) {
    this.original = Utils.clone(this.settings);
    this._settingsService.settings.subscribe(this.onNewSettings);
    this.onNewSettings(this._settingsService.settings.value);
  }

  onNewSettings = (s) => {
    this.settings = Utils.clone(this.sliceFN(s));
    this.original = Utils.clone(this.settings);
  };


  public getSettings(): Promise<void> {
    return this._settingsService.getSettings();
  }

  isSupported() {
    return true;
  }

  abstract  updateSettings(settings: T): Promise<void>;
}
