import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {DatabaseType, IPrivateConfig, ReIndexingSensitivity, ThumbnailProcessingLib} from '../../../common/config/private/IPrivateConfig';
import {NetworkService} from '../model/network/network.service';

@Injectable()
export class SettingsService {
  public settings: BehaviorSubject<IPrivateConfig>;

  constructor(private _networkService: NetworkService) {
    this.settings = new BehaviorSubject<IPrivateConfig>({
      Client: {
        Search: {
          enabled: true,
          autocompleteEnabled: true,
          instantSearchEnabled: true,
          InstantSearchTimeout: 0,
          searchCacheTimeout: 1000 * 60 * 60,
          instantSearchCacheTimeout: 1000 * 60 * 60,
          autocompleteCacheTimeout: 1000 * 60 * 60
        },
        concurrentThumbnailGenerations: null,
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
          googleApiKey: ''
        },
        urlBase: '',
        publicUrl: '',
        applicationTitle: '',
        enableCache: true,
        enableOnScrollRendering: true,
        enableOnScrollThumbnailPrioritising: true,
        authenticationRequired: true,
        languages: []
      },
      Server: {
        database: {
          type: DatabaseType.memory
        },
        sharing: {
          updateTimeout: 2000
        },
        imagesFolder: '',
        enableThreading: true,
        port: 80,
        thumbnail: {
          folder: '',
          qualityPriority: true,
          processingLibrary: ThumbnailProcessingLib.sharp
        },
        sessionTimeout: 0,
        indexing: {
          cachedFolderTimeout: 0,
          folderPreviewSize: 0,
          reIndexingSensitivity: ReIndexingSensitivity.medium
        }
      }
    });
  }

  public async getSettings(): Promise<void> {
    this.settings.next(await <Promise<IPrivateConfig>>this._networkService.getJson('/settings'));
  }


}
