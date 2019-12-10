import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {NetworkService} from '../../model/network/network.service';
import {IPrivateConfig} from '../../../../common/config/private/IPrivateConfig';
import {PrivateConfigDefaultsClass} from '../../../../common/config/private/PrivateConfigDefaultsClass';

@Injectable()
export class SettingsService {
  public settings: BehaviorSubject<IPrivateConfig>;
  private fetchingSettings = false;

  constructor(private _networkService: NetworkService) {
    this.settings = new BehaviorSubject<IPrivateConfig>(new PrivateConfigDefaultsClass());
  }

  public async getSettings(): Promise<void> {
    if (this.fetchingSettings === true) {
      return;
    }
    this.fetchingSettings = true;
    try {
      this.settings.next(await this._networkService.getJson<Promise<IPrivateConfig>>('/settings'));
    } catch (e) {
      console.error(e);
    }
    this.fetchingSettings = false;
  }


}
