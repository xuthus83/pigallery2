import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {
  DatabaseType,
  IPrivateConfig,
  LogLevel,
  ReIndexingSensitivity,
  SQLLogLevel,
  ThumbnailProcessingLib
} from '../../../../common/config/private/IPrivateConfig';
import {NetworkService} from '../../model/network/network.service';
import {SortingMethods} from '../../../../common/entities/SortingMethods';
import {UserRoles} from '../../../../common/entities/UserDTO';
import {ClientConfig} from '../../../../common/config/public/ConfigClass';

@Injectable()
export class SettingsService {
  public settings: BehaviorSubject<IPrivateConfig>;

  constructor(private _networkService: NetworkService) {
    this.settings = new BehaviorSubject<IPrivateConfig>({
      Client: {
        appVersion: '',
        Search: {
          enabled: true,
          AutoComplete: {
            enabled: true,
            cacheTimeout: 1000 * 60 * 60,
            maxItemsPerCategory: 5
          },
          instantSearchEnabled: true,
          InstantSearchTimeout: 0,
          searchCacheTimeout: 1000 * 60 * 60,
          instantSearchCacheTimeout: 1000 * 60 * 60,
        },
        Thumbnail: {
          concurrentThumbnailGenerations: null,
          iconSize: 30,
          personThumbnailSize: 200,
          thumbnailSizes: []
        },
        Sharing: {
          enabled: true,
          passwordProtected: true
        },
        Map: {
          enabled: true,
          useImageMarkers: true,
          mapProvider: ClientConfig.MapProviders.OpenStreetMap,
          mapboxAccessToken: '',
          customLayers: [{name: 'street', url: ''}]
        },
        RandomPhoto: {
          enabled: true
        },
        Video: {
          enabled: true
        },
        MetaFile: {
          enabled: true
        },
        Other: {
          captionFirstNaming: false,
          enableCache: true,
          enableOnScrollRendering: true,
          enableOnScrollThumbnailPrioritising: true,
          defaultPhotoSortingMethod: SortingMethods.ascDate,
          NavBar: {
            showItemCount: true
          }
        },
        Faces: {
          enabled: true,
          keywordsToPersons: true,
          writeAccessMinRole: UserRoles.Admin
        },
        urlBase: '',
        publicUrl: '',
        applicationTitle: '',
        authenticationRequired: true,
        unAuthenticatedUserRole: UserRoles.Admin,
        languages: []
      },
      Server: {
        Database: {
          type: DatabaseType.memory
        },
        Log: {
          level: LogLevel.info,
          sqlLevel: SQLLogLevel.error
        },
        Sharing: {
          updateTimeout: 2000
        },
        imagesFolder: '',
        port: 80,
        host: '0.0.0.0',
        Thumbnail: {
          personFaceMargin: 0.1,
          folder: '',
          qualityPriority: true,
          processingLibrary: ThumbnailProcessingLib.sharp
        },
        Threading: {
          enable: true,
          thumbnailThreads: 0
        },
        sessionTimeout: 0,
        Indexing: {
          cachedFolderTimeout: 0,
          folderPreviewSize: 0,
          reIndexingSensitivity: ReIndexingSensitivity.medium,
          excludeFolderList: [],
          excludeFileList: []
        },
        photoMetadataSize: 512 * 1024,
        Duplicates: {
          listingLimit: 1000
        },
        Tasks: {
          scheduled: []
        },
        Video: {
          transcoding: {
            bitRate: 5 * 1024 * 1024,
            codec: 'libx264',
            format: 'mp4',
            fps: 25,
            resolution: 720
          }
        }
      }
    });
  }

  public async getSettings(): Promise<void> {
    this.settings.next(await <Promise<IPrivateConfig>>this._networkService.getJson('/settings'));
  }


}
