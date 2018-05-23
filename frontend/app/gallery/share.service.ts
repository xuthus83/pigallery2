import {Injectable} from '@angular/core';
import {NetworkService} from '../model/network/network.service';
import {CreateSharingDTO, SharingDTO} from '../../../common/entities/SharingDTO';
import {Router, RoutesRecognized} from '@angular/router';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class ShareService {

  public sharing: BehaviorSubject<SharingDTO>;
  param = null;
  queryParam = null;
  sharingKey = null;
  inited = false;
  public ReadyPR: Promise<void>;
  private resolve;


  constructor(private _networkService: NetworkService, private router: Router) {
    this.sharing = new BehaviorSubject(null);
    this.ReadyPR = new Promise((resolve) => {
      if (this.inited === true) {
        return resolve();
      }
      this.resolve = resolve;
    });

    this.router.events.subscribe(val => {
      if (val instanceof RoutesRecognized) {
        this.param = val.state.root.firstChild.params['sharingKey'] || null;
        this.queryParam = val.state.root.firstChild.queryParams['sk'] || null;
        const changed = this.sharingKey !== this.param || this.queryParam;
        if (changed) {
          this.sharingKey = this.param || this.queryParam;
          this.getSharing();
        }
        if (this.resolve) {
          this.resolve();
          this.inited = true;
        }

      }
    });

  }


  public wait(): Promise<void> {
    return this.ReadyPR;
  }

  public createSharing(dir: string, includeSubfolders: boolean, valid: number): Promise<SharingDTO> {
    return this._networkService.postJson('/share/' + dir, {
      createSharing: <CreateSharingDTO>{
        includeSubfolders: includeSubfolders,
        valid: valid
      }
    });
  }

  public updateSharing(dir: string, sharingId: number, includeSubfolders: boolean, password: string, valid: number): Promise<SharingDTO> {
    return this._networkService.putJson('/share/' + dir, {
      updateSharing: <CreateSharingDTO>{
        id: sharingId,
        includeSubfolders: includeSubfolders,
        valid: valid,
        password: password
      }
    });
  }

  public getSharingKey() {
    return this.sharingKey;
  }

  public isSharing(): boolean {
    return this.sharingKey != null;

  }

  public async getSharing(): Promise<SharingDTO> {
    const sharing = await this._networkService.getJson<SharingDTO>('/share/' + this.getSharingKey());
    this.sharing.next(sharing);
    return sharing;
  }
}
