import {Injectable} from '@angular/core';
import {SharingDTO} from '../../../../../common/entities/SharingDTO';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';

@Injectable({
  providedIn: 'root'
})
export class SharingListService {

  constructor(private networkService: NetworkService,
              private settingsService: SettingsService) {
  }


  public getSharingList(): Promise<SharingDTO[]> {
    if (!this.settingsService.settings.value.Sharing.enabled) {
      return Promise.resolve([]);
    }
    return this.networkService.getJson('/share/list');
  }

  public deleteSharing(sharing: SharingDTO): Promise<void> {
    return this.networkService.deleteJson('/share/' + sharing.sharingKey);
  }
}
