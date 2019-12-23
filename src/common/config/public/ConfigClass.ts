import {SortingMethods} from '../../entities/SortingMethods';
import {UserRoles} from '../../entities/UserDTO';

export module ClientConfig {

  export enum MapProviders {
    OpenStreetMap = 0, Mapbox = 1, Custom = 2
  }

  export interface AutoCompleteConfig {
    enabled: boolean;
    maxItemsPerCategory: number;
    cacheTimeout: number;
  }

  export interface SearchConfig {
    enabled: boolean;
    instantSearchEnabled: boolean;
    InstantSearchTimeout: number;
    instantSearchCacheTimeout: number;
    searchCacheTimeout: number;
    AutoComplete: AutoCompleteConfig;
  }

  export interface SharingConfig {
    enabled: boolean;
    passwordProtected: boolean;
  }

  export interface RandomPhotoConfig {
    enabled: boolean;
  }

  export interface MapLayers {
    name: string;
    url: string;
  }

  export interface MapConfig {
    enabled: boolean;
    useImageMarkers: boolean;
    mapProvider: MapProviders;
    mapboxAccessToken: string;
    customLayers: MapLayers[];
  }

  export interface ThumbnailConfig {
    iconSize: number;
    personThumbnailSize: number;
    thumbnailSizes: number[];
    concurrentThumbnailGenerations: number;
  }

  export interface NavBarConfig {
    showItemCount: boolean;
  }

  export interface OtherConfig {
    enableCache: boolean;
    enableOnScrollRendering: boolean;
    defaultPhotoSortingMethod: SortingMethods;
    enableOnScrollThumbnailPrioritising: boolean;
    NavBar: NavBarConfig;
    captionFirstNaming: boolean; // shows the caption instead of the filename in the photo grid
  }

  export interface VideoConfig {
    enabled: boolean;
  }

  export interface PhotoConfig {
    Converting: {
      enabled: boolean;
    };
  }

  export interface MediaConfig {
    Thumbnail: ThumbnailConfig;
    Video: VideoConfig;
    Photo: PhotoConfig;
  }

  export interface MetaFileConfig {
    enabled: boolean;
  }

  export interface FacesConfig {
    enabled: boolean;
    keywordsToPersons: boolean;
    writeAccessMinRole: UserRoles;
  }

  export interface Config {
    appVersion: string;
    buildTime: string;
    buildCommitHash: string;
    applicationTitle: string;
    publicUrl: string;
    urlBase: string;
    Search: SearchConfig;
    Sharing: SharingConfig;
    Map: MapConfig;
    RandomPhoto: RandomPhotoConfig;
    Other: OtherConfig;
    authenticationRequired: boolean;
    unAuthenticatedUserRole: UserRoles;
    languages: string[];
    Media: MediaConfig;
    MetaFile: MetaFileConfig;
    Faces: FacesConfig;
  }

}

/**
 * These configuration will be available at frontend and backend too
 */
export class PublicConfigClass {

  public Client: ClientConfig.Config = {
    applicationTitle: 'PiGallery 2',
    appVersion: '',
    buildCommitHash: '',
    buildTime: '',
    Media: {
      Video: {
        enabled: true
      },
      Photo: {
        Converting: {
          enabled: true
        }
      },
      Thumbnail: {
        concurrentThumbnailGenerations: 1,
        thumbnailSizes: [160, 240, 480],
        iconSize: 45,
        personThumbnailSize: 200
      }
    },
    Search: {
      enabled: true,
      instantSearchEnabled: true,
      InstantSearchTimeout: 3000,
      searchCacheTimeout: 1000 * 60 * 60,
      instantSearchCacheTimeout: 1000 * 60 * 60,
      AutoComplete: {
        enabled: true,
        cacheTimeout: 1000 * 60 * 60,
        maxItemsPerCategory: 5
      }
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
    authenticationRequired: true,
    unAuthenticatedUserRole: UserRoles.Admin,
    publicUrl: '',
    urlBase: '',
    languages: []
  };

}

