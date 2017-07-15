import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {DatabaseType, IPrivateConfig, ThumbnailProcessingLib} from "../../../common/config/private/IPrivateConfig";
import {NetworkService} from "../model/network/network.service";
@Injectable()
export class SettingsService {
  public settings: BehaviorSubject<IPrivateConfig>;

  constructor(private _networkService: NetworkService) {
    this.settings = new BehaviorSubject<IPrivateConfig>(<any>{
      Client: {
        Search: {
          enabled: true,
          autocompleteEnabled: true,
          instantSearchEnabled: true
        },
        Thumbnail: {
          iconSize: 30,
          thumbnailSizes: []
        },
        Sharing: {
          enabled: true,
          passwordProtected: true
        },
        Map: {
          enabled: true,
          googleApiKey: ""
        }, publicUrl: "",
        applicationTitle: "",
        enableCache: true,
        enableOnScrollRendering: true,
        enableOnScrollThumbnailPrioritising: true,
        authenticationRequired: true
      }, Server: {
        database: {
          type: DatabaseType.memory
        },
        imagesFolder: "",
        sharing: {
          updateTimeout: 2000
        },
        enableThreading: true,
        port: 80,
        thumbnail: {
          folder: "",
          qualityPriority: true,
          processingLibrary: ThumbnailProcessingLib.sharp
        }
      }
    });
  }

  public async  getSettings(): Promise<void> {
    this.settings.next(await <Promise<IPrivateConfig>>this._networkService.getJson("/settings"));
  }


}
