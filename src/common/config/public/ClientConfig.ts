/* tslint:disable:no-inferrable-types */
import 'reflect-metadata';
import {SortingMethods} from '../../entities/SortingMethods';
import {UserRoles} from '../../entities/UserDTO';
import { SubConfigClass } from 'typeconfig/src/decorators/class/SubConfigClass';
import { ConfigProperty } from 'typeconfig/src/decorators/property/ConfigPropoerty';


export module ClientConfig {

  export enum MapProviders {
    OpenStreetMap = 0, Mapbox = 1, Custom = 2
  }

  @SubConfigClass()
  export class AutoCompleteConfig {
    @ConfigProperty()
    enabled = true;
    @ConfigProperty()
    maxItemsPerCategory = 5;
    @ConfigProperty()
    cacheTimeout: number = 1000 * 60 * 60;
  }

  @SubConfigClass()
  export class SearchConfig {
    @ConfigProperty()
    enabled: boolean = true;
    @ConfigProperty()
    instantSearchEnabled: boolean = true;
    @ConfigProperty()
    InstantSearchTimeout: number = 3000;
    @ConfigProperty()
    instantSearchCacheTimeout: number = 1000 * 60 * 60;
    @ConfigProperty()
    searchCacheTimeout: number = 1000 * 60 * 60;
    @ConfigProperty()
    AutoComplete: AutoCompleteConfig = new AutoCompleteConfig();
  }

  @SubConfigClass()
  export class SharingConfig {
    @ConfigProperty()
    enabled: boolean = true;
    @ConfigProperty()
    passwordProtected: boolean = true;
  }

  @SubConfigClass()
  export class RandomPhotoConfig {
    @ConfigProperty()
    enabled: boolean = true;
  }

  @SubConfigClass()
  export class MapLayers {
    @ConfigProperty()
    name: string = 'street';
    @ConfigProperty()
    url: string = '';
  }

  @SubConfigClass()
  export class MapConfig {
    @ConfigProperty()
    enabled: boolean = true;
    @ConfigProperty()
    useImageMarkers: boolean = true;
    @ConfigProperty()
    mapProvider: MapProviders = MapProviders.OpenStreetMap;
    @ConfigProperty()
    mapboxAccessToken: string = '';
    @ConfigProperty({arrayType: MapLayers})
    customLayers: MapLayers[] = [new MapLayers()];
  }

  @SubConfigClass()
  export class ThumbnailConfig {
    @ConfigProperty()
    iconSize: number = 45;
    @ConfigProperty()
    personThumbnailSize: number = 200;
    @ConfigProperty({arrayType: Number})
    thumbnailSizes: number[] = [240, 480];
    @ConfigProperty({volatile: true})
    concurrentThumbnailGenerations: number = 1;
  }

  @SubConfigClass()
  export class NavBarConfig {
    @ConfigProperty()
    showItemCount: boolean = true;
  }

  @SubConfigClass()
  export class OtherConfig {
    @ConfigProperty()
    enableCache: boolean = true;
    @ConfigProperty()
    enableOnScrollRendering: boolean = true;
    @ConfigProperty({type: SortingMethods})
    defaultPhotoSortingMethod: SortingMethods = SortingMethods.ascDate;
    @ConfigProperty()
    enableOnScrollThumbnailPrioritising: boolean = true;
    @ConfigProperty()
    NavBar: NavBarConfig = new NavBarConfig();
    @ConfigProperty()
    captionFirstNaming: boolean = false; // shows the caption instead of the filename in the photo grid
  }

  @SubConfigClass()
  export class VideoConfig {
    @ConfigProperty()
    enabled: boolean = true;
  }

  @SubConfigClass()
  export class PhotoConvertingConfig {
    @ConfigProperty()
    enabled: boolean = true;
  }

  @SubConfigClass()
  export class PhotoConfig {
    @ConfigProperty()
    Converting: PhotoConvertingConfig = new PhotoConvertingConfig();
  }

  @SubConfigClass()
  export class MediaConfig {
    @ConfigProperty()
    Thumbnail: ThumbnailConfig = new ThumbnailConfig();
    @ConfigProperty()
    Video: VideoConfig = new VideoConfig();
    @ConfigProperty()
    Photo: PhotoConfig = new PhotoConfig();
  }

  @SubConfigClass()
  export class MetaFileConfig {
    @ConfigProperty()
    enabled: boolean = true;
  }

  @SubConfigClass()
  export class FacesConfig {
    @ConfigProperty()
    enabled: boolean = true;
    @ConfigProperty()
    keywordsToPersons: boolean = true;
    @ConfigProperty({type: UserRoles})
    writeAccessMinRole: UserRoles = UserRoles.Admin;
  }

  @SubConfigClass()
  export class Config {


    @ConfigProperty({volatile: true})
    upTime: string;
    @ConfigProperty({volatile: true})
    appVersion: string;
    @ConfigProperty({volatile: true})
    buildTime: string;
    @ConfigProperty({volatile: true})
    buildCommitHash: string;
    @ConfigProperty()
    applicationTitle: string = 'PiGallery 2';
    @ConfigProperty()
    publicUrl: string = '';
    @ConfigProperty()
    urlBase: string = '';
    @ConfigProperty()
    Search: SearchConfig = new SearchConfig();
    @ConfigProperty()
    Sharing: SharingConfig = new SharingConfig();
    @ConfigProperty()
    Map: MapConfig = new MapConfig();
    @ConfigProperty()
    RandomPhoto: RandomPhotoConfig = new RandomPhotoConfig();
    @ConfigProperty()
    Other: OtherConfig = new OtherConfig();
    @ConfigProperty()
    authenticationRequired: boolean = true;
    @ConfigProperty({type: UserRoles})
    unAuthenticatedUserRole: UserRoles = UserRoles.Admin;
    @ConfigProperty({arrayType: String, volatile: true})
    languages: string[];
    @ConfigProperty()
    Media: MediaConfig = new MediaConfig();
    @ConfigProperty()
    MetaFile: MetaFileConfig = new MetaFileConfig();
    @ConfigProperty()
    Faces: FacesConfig = new FacesConfig();
  }

}

