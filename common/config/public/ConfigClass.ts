import {SortingMethods} from '../../entities/SortingMethods';

export module ClientConfig {
  export interface SearchConfig {
    enabled: boolean;
    instantSearchEnabled: boolean;
    autocompleteEnabled: boolean;
    InstantSearchTimeout: number;
    autocompleteCacheTimeout: number;
    instantSearchCacheTimeout: number;
    searchCacheTimeout: number;
  }

  export interface SharingConfig {
    enabled: boolean;
    passwordProtected: boolean;
  }

  export interface RandomPhotoConfig {
    enabled: boolean;
  }

  export interface MapConfig {
    enabled: boolean;
    googleApiKey: string;
  }

  export interface ThumbnailConfig {
    iconSize: number;
    thumbnailSizes: Array<number>;
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
  }

  export interface Config {
    applicationTitle: string;
    publicUrl: string;
    urlBase: string;
    Thumbnail: ThumbnailConfig;
    Search: SearchConfig;
    Sharing: SharingConfig;
    Map: MapConfig;
    RandomPhoto: RandomPhotoConfig;
    Other: OtherConfig;
    authenticationRequired: boolean;
    languages: string[];
  }

}

/**
 * These configuration will be available at frontend and backend too
 */
export class PublicConfigClass {

  public Client: ClientConfig.Config = {
    applicationTitle: 'PiGallery 2',
    Thumbnail: {
      concurrentThumbnailGenerations: 1,
      thumbnailSizes: [200, 400, 600],
      iconSize: 30
    },
    Search: {
      enabled: true,
      instantSearchEnabled: true,
      autocompleteEnabled: true,
      InstantSearchTimeout: 3000,
      autocompleteCacheTimeout: 1000 * 60 * 60,
      searchCacheTimeout: 1000 * 60 * 60,
      instantSearchCacheTimeout: 1000 * 60 * 60
    },
    Sharing: {
      enabled: true,
      passwordProtected: true
    },
    Map: {
      enabled: true,
      googleApiKey: ''
    },
    RandomPhoto: {
      enabled: true
    },
    Other: {
      enableCache: true,
      enableOnScrollRendering: true,
      enableOnScrollThumbnailPrioritising: true,
      defaultPhotoSortingMethod: SortingMethods.ascDate,
      NavBar: {
        showItemCount: true
      }
    },
    authenticationRequired: true,
    publicUrl: '',
    urlBase: '',
    languages: []
  };

}

