import {Injectable} from '@angular/core';
import {SharingDTO} from '../../../../../common/entities/SharingDTO';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {Config} from '../../../../../common/config/public/Config';

@Injectable({
  providedIn: 'root'
})
export class SharingListService {

  constructor(private networkService: NetworkService) {
  }


  public getSharingList(): Promise<SharingDTO[]> {
    if (!Config.Sharing.enabled) {
      return Promise.resolve([]);
    }
    return this.networkService.getJson('/share/list');
  }

  public deleteSharing(sharing: SharingDTO): Promise<void> {
    return this.networkService.deleteJson('/share/' + sharing.sharingKey);
  }
}
