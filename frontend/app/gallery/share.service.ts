import {Injectable} from "@angular/core";
import {NetworkService} from "../model/network/network.service";
import {CreateSharingDTO, SharingDTO} from "../../../common/entities/SharingDTO";
import {Router, RoutesRecognized} from "@angular/router";

@Injectable()
export class ShareService {

  param = null;
  queryParam = null;
  sharingKey = null;
  inited = false;
  public ReadyPR: Promise<void>;
  private resolve;


  constructor(private _networkService: NetworkService, private router: Router) {

    this.ReadyPR = new Promise((resolve) => {
      if (this.inited == true) {
        return resolve();
      }
      this.resolve = resolve;
    });

    this.router.events.subscribe(val => {
      if (val instanceof RoutesRecognized) {
        this.param = val.state.root.firstChild.params["sharingKey"] || null;
        this.queryParam = val.state.root.firstChild.queryParams["sk"] || null;
        this.sharingKey = this.param || this.queryParam;
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

  public getSharing(dir: string, includeSubfolders: boolean, valid: number): Promise<SharingDTO> {
    return this._networkService.postJson("/share/" + dir, {
      createSharing: <CreateSharingDTO>{
        includeSubfolders: includeSubfolders,
        valid: valid
      }
    });
  }

  public updateSharing(dir: string, sharingId: number, includeSubfolders: boolean, valid: number): Promise<SharingDTO> {
    return this._networkService.putJson("/share/" + dir, {
      updateSharing: <CreateSharingDTO>{
        id: sharingId,
        includeSubfolders: includeSubfolders,
        valid: valid
      }
    });
  }

  public getSharingKey() {
    return this.sharingKey;
  }

  public isSharing(): boolean {
    return this.sharingKey != null;

  }
}
