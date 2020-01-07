import {Injectable} from '@angular/core';
import {LoginCredential} from '../../../../common/entities/LoginCredential';
import {NetworkService} from './network.service';
import {UserDTO} from '../../../../common/entities/UserDTO';
import {Config} from '../../../../common/config/public/Config';
import {ShareService} from '../../ui/gallery/share.service';
import {QueryParams} from '../../../../common/QueryParams';

@Injectable()
export class UserService {

  constructor(private _networkService: NetworkService,
              private _shareService: ShareService) {
  }

  public async logout(): Promise<string> {
    return this._networkService.postJson('/user/logout');
  }

  public async login(credential: LoginCredential): Promise<UserDTO> {
    return this._networkService.postJson<UserDTO>('/user/login', {loginCredential: credential});
  }

  public async shareLogin(password: string): Promise<UserDTO> {
    return this._networkService.postJson<UserDTO>('/share/login?' + QueryParams.gallery.sharingKey_query
      + '=' + this._shareService.getSharingKey(), {'password': password});
  }

  public async getSessionUser(): Promise<UserDTO> {
    await this._shareService.wait();
    if (Config.Client.Sharing.enabled === true) {
      if (this._shareService.isSharing()) {
        const query: any = {};
        query[QueryParams.gallery.sharingKey_query] = this._shareService.getSharingKey();
        return this._networkService.getJson<UserDTO>('/user/me', query);
      }
    }
    return this._networkService.getJson<UserDTO>('/user/me');
  }

}
