/* eslint-disable @typescript-eslint/no-inferrable-types */
import 'reflect-metadata';
import {SortingMethods} from '../../entities/SortingMethods';
import {UserRoles} from '../../entities/UserDTO';
import {ConfigProperty, SubConfigClass} from 'typeconfig/common';
import {SearchQueryDTO} from '../../entities/SearchQueryDTO';
import {DefaultsJobs} from '../../entities/job/JobDTO';

declare let $localize: (s: TemplateStringsArray) => string;
if (typeof $localize === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  global.$localize = (s) => s;
}


export enum MapProviders {
  OpenStreetMap = 1,
  Mapbox = 2,
  Custom = 3,
}

export enum ConfigPriority {
  basic = 0, advanced, underTheHood
}

export type TAGS = {
  client?: true,
  priority?: ConfigPriority,
  name?: string,
  relevant?: (c: any) => boolean,
  dockerSensitive?: boolean,
  hint?: string,// UI hint
  githubIssue?: number,
  secret?: boolean, // these config properties should never travel out of the server
  experimental?: boolean, //is it a beta feature
  unit?: string, // Unit info to display on UI
  uiIcon?: string,
  uiType?: 'SearchQuery', // Hint for the UI about the type
  uiOptions?: (string | number)[], //Hint for the UI about the recommended options
  uiAllowSpaces?: boolean
  uiOptional?: boolean; //makes the tag not "required"
  uiDisabled?: (subConfig: any, config: ClientConfig) => boolean
  uiJob?: {
    job: string,
    hideProgress: boolean,
    relevant?: (c: ClientConfig) => boolean,
    description: string
  }[],
  uiResetNeeded?: {
    server?: boolean,
    db?: boolean
  }
};

@SubConfigClass<TAGS>({tags: {client: true}, softReadonly: true})
export class AutoCompleteConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Enable Autocomplete`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Show hints while typing search query.`
  })
  enabled: boolean = true;
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Max items per category`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown per category.`
  })
  targetItemsPerCategory: number = 5;
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Maximum items`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown at once.`
  })
  maxItems: number = 30;
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Cache timeout`,
        priority: ConfigPriority.underTheHood,
        unit: 'ms'
      },
    description: $localize`Autocomplete cache timeout. `
  })
  cacheTimeout: number = 1000 * 60 * 60;
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientSearchConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Enable`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Enables searching.`
  })
  enabled: boolean = true;
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Cache timeout`,
        priority: ConfigPriority.underTheHood,
        unit: 'ms'
      },
    description: $localize`Search cache timeout.`
  })
  searchCacheTimeout: number = 1000 * 60 * 60;
  @ConfigProperty({
    tags:
      {
        name: $localize`Autocomplete`,
        priority: ConfigPriority.advanced
      },
  })
  AutoComplete: AutoCompleteConfig = new AutoCompleteConfig();
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Maximum media result`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Maximum number of photos and videos that are listed in one search result.`
  })
  maxMediaResult: number = 10000;
  @ConfigProperty({
    type: 'unsignedInt', tags:
      {
        name: $localize`Maximum directory result`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Maximum number of directories that are listed in one search result.`
  })
  maxDirectoryResult: number = 200;
  @ConfigProperty({
    tags:
      {
        name: $localize`List directories`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Search returns also with directories, not just media.`
  })
  listDirectories: boolean = false;
  @ConfigProperty({
    tags:
      {
        name: $localize`List metafiles`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Search also returns with metafiles from directories that contain a media file of the matched search result.`,
  })
  listMetafiles: boolean = true;
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientAlbumConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Enable`,
        priority: ConfigPriority.advanced
      }
  })
  enabled: boolean = true;
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientSharingConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Enable`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Enables sharing.`,
  })
  enabled: boolean = true;
  @ConfigProperty({
    tags:
      {
        name: $localize`Password protected`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Enables password protected sharing links.`,
  })
  passwordProtected: boolean = true;
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientRandomPhotoConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Enable`,
        priority: ConfigPriority.advanced
      },
    description: $localize`Enables random link generation.`,
  })
  enabled: boolean = true;
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class MapLayers {
  @ConfigProperty({
    tags:
      {
        priority: ConfigPriority.advanced
      },
    description: $localize`Name of a map layer.`,
  })
  name: string = 'street';
  @ConfigProperty({
    tags:
      {
        priority: ConfigPriority.advanced,
        hint: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      },
    description: $localize`Url of a map layer.`,
  })
  url: string = '';
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientMapConfig {
  @ConfigProperty<boolean, ClientConfig, TAGS>({
    onNewValue: (value, config) => {
      if (value === false) {
        config.MetaFile.gpx = false;
      }
    },
    tags: {
      priority: ConfigPriority.advanced,
      name: $localize`Enable`
    }
  })
  enabled: boolean = true;
  @ConfigProperty({
    tags: {
      name: $localize`Image Markers`,
      priority: ConfigPriority.underTheHood
    },
    description: $localize`Map will use thumbnail images as markers instead of the default pin.`,
  })
  useImageMarkers: boolean = true;
  @ConfigProperty({
    type: MapProviders,
    tags: {
      name: $localize`Map Provider`,
      priority: ConfigPriority.advanced
    }
  })
  mapProvider: MapProviders = MapProviders.OpenStreetMap;
  @ConfigProperty({
    tags:
      {
        name: $localize`Mapbox access token`,
        relevant: (c: any) => c.mapProvider === MapProviders.Mapbox,
        priority: ConfigPriority.advanced
      },
    description: $localize`MapBox needs an access token to work, create one at https://www.mapbox.com.`,
  })
  mapboxAccessToken: string = '';
  @ConfigProperty({
    arrayType: MapLayers,
    description: $localize`The map module will use these urls to fetch the map tiles.`,
    tags: {
      relevant: (c: any) => c.mapProvider === MapProviders.Custom,
      name: $localize`Custom Layers`,
      priority: ConfigPriority.advanced
    }

  })
  customLayers: MapLayers[] = [new MapLayers()];

  @ConfigProperty({
    type: 'unsignedInt',
    tags: {
      name: $localize`Max Preview Markers`,
      priority: ConfigPriority.underTheHood
    } as TAGS,
    description: $localize`Maximum number of markers to be shown on the map preview on the gallery page.`,
  })
  maxPreviewMarkers: number = 50;
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientThumbnailConfig {
  @ConfigProperty({
    type: 'unsignedInt', max: 100,
    tags: {
      name: $localize`Map Icon size`,
      unit: 'px',
      priority: ConfigPriority.underTheHood
    },
    description: $localize`Icon size (used on maps).`,
  })
  iconSize: number = 45;
  @ConfigProperty({
    type: 'unsignedInt', tags: {
      name: $localize`Person thumbnail size`,
      unit: 'px',
      priority: ConfigPriority.underTheHood
    },
    description: $localize`Person (face) thumbnail size.`,
  })
  personThumbnailSize: number = 200;
  @ConfigProperty({
    arrayType: 'unsignedInt', tags: {
      name: $localize`Thumbnail sizes`,
      priority: ConfigPriority.advanced
    },
    description: $localize`Size of the thumbnails. The best matching size will be generated. More sizes give better quality, but use more storage and CPU to render. If size is 240, that shorter side of the thumbnail will have 160 pixels.`,
  })
  thumbnailSizes: number[] = [240, 480];
  @ConfigProperty({
    volatile: true,
    description: 'Updated to match he number of CPUs. This manny thumbnail will be concurrently generated.',
  })
  concurrentThumbnailGenerations: number = 1;

  /**
   * Generates a map for bitwise operation from icon and normal thumbnails
   */
  generateThumbnailMap(): { [key: number]: number } {
    const m: { [key: number]: number } = {};
    [this.iconSize, ...this.thumbnailSizes.sort()].forEach((v, i) => {
      m[v] = Math.pow(2, i + 1);
    });
    return m;
  }

  /**
   * Generates a map for bitwise operation from icon and normal thumbnails
   */
  generateThumbnailMapEntries(): { size: number, bit: number }[] {
    return Object.entries(this.generateThumbnailMap()).map(v => ({size: parseInt(v[0]), bit: v[1]}));
  }
}

export enum NavigationLinkTypes {
  gallery = 1, faces, albums, search, url
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class NavigationLinkConfig {
  @ConfigProperty({
    type: NavigationLinkTypes,
    tags: {
      name: $localize`Type`,
      priority: ConfigPriority.advanced
    } as TAGS
  })
  type: NavigationLinkTypes = NavigationLinkTypes.gallery;
  @ConfigProperty({
    type: 'string',
    tags: {
      name: $localize`Name`,
      priority: ConfigPriority.advanced
    }
  })
  name?: string;
  @ConfigProperty({
    type: 'object',
    tags: {
      name: $localize`SearchQuery`,
      priority: ConfigPriority.advanced,
      uiType: 'SearchQuery',
      relevant: (c: NavigationLinkConfig) => c.type === NavigationLinkTypes.search
    }
  })
  SearchQuery?: SearchQueryDTO;
  @ConfigProperty({
    type: 'string',
    tags: {
      name: $localize`Url`,
      priority: ConfigPriority.advanced,
      relevant: (c: NavigationLinkConfig) => c.type === NavigationLinkTypes.url
    }
  })
  url?: string;


  constructor(type: NavigationLinkTypes = NavigationLinkTypes.gallery,
              name?: string, SearchQuery?: SearchQueryDTO, url?: string) {

    this.type = type;
    this.name = name;
    this.SearchQuery = SearchQuery;
    this.url = url;
  }
}

@SubConfigClass<TAGS>({tags: {client: true}, softReadonly: true})
export class NavBarConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Show item count`,
      priority: ConfigPriority.underTheHood
    },
    description: $localize`Shows the number photos and videos on the navigation bar.`,
  })
  showItemCount: boolean = true;
  @ConfigProperty({
    arrayType: NavigationLinkConfig,
    tags: {
      name: $localize`Links`,
      priority: ConfigPriority.advanced,
      experimental: true,
      githubIssue: 174
    },
    description: $localize`Visible links in the top menu.`
  })
  links: NavigationLinkConfig[] = [
    new NavigationLinkConfig(NavigationLinkTypes.gallery),
    new NavigationLinkConfig(NavigationLinkTypes.albums),
    new NavigationLinkConfig(NavigationLinkTypes.faces),
  ];
  @ConfigProperty({
    tags: {
      name: $localize`Navbar show/hide delay`,
      priority: ConfigPriority.underTheHood
    },
    type: 'ratio',
    description: $localize`Ratio of the page height, you need to scroll to show or hide the navigationbar.`,
  })
  NavbarShowHideDelay: number = 0.15;
}

@SubConfigClass<TAGS>({tags: {client: true}, softReadonly: true})
export class ClientLightboxConfig {

  @ConfigProperty({
    tags: {
      name: $localize`Default slideshow speed`,
      priority: ConfigPriority.underTheHood,
      githubIssue: 570,
      unit: 's'
    },
    description: $localize`Default time interval for displaying a photo in the slide show.`
  })
  defaultSlideshowSpeed: number = 5;

  @ConfigProperty({
    tags: {
      name: $localize`Always show captions`,
      priority: ConfigPriority.underTheHood,
    },
    description: $localize`If enabled, lightbox will always show caption by default, not only on hover.`
  })
  captionAlwaysOn: boolean = false;
  @ConfigProperty({
    tags: {
      name: $localize`Always show faces`,
      priority: ConfigPriority.underTheHood,
    },
    description: $localize`If enabled, lightbox will always show faces by default, not only on hover.`
  })
  facesAlwaysOn: boolean = false;
  @ConfigProperty({
    tags: {
      name: $localize`Loop Videos`,
      priority: ConfigPriority.underTheHood,
    },
    description: $localize`If enabled, lightbox will loop videos by default.`
  })
  loopVideos: boolean = false;
}

@SubConfigClass<TAGS>({tags: {client: true}, softReadonly: true})
export class ClientGalleryConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Cache`,
      priority: ConfigPriority.underTheHood,
    },
    description: $localize`Caches directory contents and search results for better performance.`
  })
  enableCache: boolean = true;
  @ConfigProperty({
    tags: {
      name: $localize`Scroll based thumbnail generation`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Those thumbnails get higher priority that are visible on the screen.`
  })
  enableOnScrollRendering: boolean = true;

  @ConfigProperty({
    type: SortingMethods, tags: {
      name: $localize`Default sorting`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Default sorting method for photo and video in a directory results.`
  })
  defaultPhotoSortingMethod: SortingMethods = SortingMethods.ascDate;

  @ConfigProperty({
    type: SortingMethods, tags: {
      name: $localize`Default search sorting`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Default sorting method for photo and video in a search results.`
  })
  defaultSearchSortingMethod: SortingMethods = SortingMethods.descDate;

  @ConfigProperty({
    tags: {
      name: $localize`Sort directories by date`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`If enabled, directories will be sorted by date, like photos, otherwise by name. Directory date is the last modification time of that directory not the creation date of the oldest photo.`
  })
  enableDirectorySortingByDate: boolean = false;

  @ConfigProperty({
    tags: {
      name: $localize`On scroll thumbnail prioritising`,
      priority: ConfigPriority.underTheHood,
    },
    description: $localize`Those thumbnails will be rendered first that are in view.`
  })
  enableOnScrollThumbnailPrioritising: boolean = true;
  @ConfigProperty({
    tags: {
      name: $localize`Navigation bar`,
      priority: ConfigPriority.advanced,
    } as TAGS
  })
  NavBar: NavBarConfig = new NavBarConfig();
  @ConfigProperty({
    tags: {
      name: $localize`Caption first naming`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Show the caption (IPTC 120) tags from the EXIF data instead of the filenames.`
  })
  captionFirstNaming: boolean = false; // shows the caption instead of the filename in the photo grid
  @ConfigProperty({
    tags: {
      name: $localize`Download Zip`,
      priority: ConfigPriority.advanced,
      experimental: true,
      githubIssue: 52
    },
    description: $localize`Enable download zip of a directory contents Directory flattening. (Does not work for searches.)`
  })
  enableDownloadZip: boolean = false;
  @ConfigProperty({
    tags: {
      name: $localize`Directory flattening`,
      priority: ConfigPriority.advanced,
      experimental: true,
      githubIssue: 174
    },
    description: $localize`Adds a button to flattens the file structure, by listing the content of all subdirectories. (Won't work if the gallery has multiple folders with the same path.)`
  })
  enableDirectoryFlattening: boolean = false;
  @ConfigProperty({
    tags: {
      name: $localize`Lightbox`,
      priority: ConfigPriority.advanced,
    },
  })
  Lightbox: ClientLightboxConfig = new ClientLightboxConfig();
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientVideoConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Enable`,
      priority: ConfigPriority.advanced,
      uiResetNeeded: {db: true}
    }
  })
  enabled: boolean = true;
  @ConfigProperty({
    arrayType: 'string',
    tags: {
      name: $localize`Supported formats with transcoding`,
      priority: ConfigPriority.underTheHood,
      uiDisabled: (sb: ClientVideoConfig) => !sb.enabled,
      uiResetNeeded: {db: true}
    } as TAGS,
    description: $localize`Video formats that are supported after transcoding (with the build-in ffmpeg support).`
  })
  supportedFormatsWithTranscoding: string[] = ['avi', 'mkv', 'mov', 'wmv', 'flv', 'mts', 'm2ts', 'mpg', '3gp', 'm4v', 'mpeg', 'vob', 'divx', 'xvid', 'ts'];
  // Browser supported video formats
  // Read more:  https://www.w3schools.com/html/html5_video.asp
  @ConfigProperty({
    arrayType: 'string',
    tags: {
      name: $localize`Supported formats without transcoding`,
      priority: ConfigPriority.underTheHood,
      uiDisabled: (sb: ClientVideoConfig) => !sb.enabled,
      uiResetNeeded: {db: true}
    },
    description: $localize`Video formats that are supported also without transcoding. Browser supported formats: https://www.w3schools.com/html/html5_video.asp`
  })
  supportedFormats: string[] = ['mp4', 'webm', 'ogv', 'ogg'];

}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientPhotoConvertingConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Enable`
    } as TAGS,
    description: $localize`Enable photo converting.`
  })
  enabled: boolean = true;

  @ConfigProperty({
    tags: {
      name: $localize`Load full resolution image on zoom.`,
      priority: ConfigPriority.advanced,
      uiDisabled: (sc: ClientPhotoConvertingConfig) =>
        !sc.enabled
    },
    description: $localize`Enables loading the full resolution image on zoom in the ligthbox (preview).`,
  })
  loadFullImageOnZoom: boolean = true;
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientPhotoConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Photo converting`,
      priority: ConfigPriority.advanced
    }
  })
  Converting: ClientPhotoConvertingConfig = new ClientPhotoConvertingConfig();

  @ConfigProperty({
    arrayType: 'string',
    tags: {
      name: $localize`Supported photo formats`,
      priority: ConfigPriority.underTheHood,
      uiResetNeeded: {db: true}
    },
    description: $localize`Photo formats that are supported. Browser needs to support these formats natively. Also sharp (libvips) package should be able to convert these formats.`,
  })
  supportedFormats: string[] = ['gif', 'jpeg', 'jpg', 'jpe', 'png', 'webp', 'svg'];
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientGPXCompressingConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Enable GPX compressing`,
      priority: ConfigPriority.advanced,
      githubIssue: 504,
      uiDisabled: (sc: any, c: ClientConfig) => !c.Map.enabled
    },
    description: $localize`Enables lossy (based on delta time and distance. Too frequent points are removed) GPX compression.`
  })
  enabled: boolean = true;
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientMediaConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Thumbnail`,
      priority: ConfigPriority.advanced
    }
  })
  Thumbnail: ClientThumbnailConfig = new ClientThumbnailConfig();
  @ConfigProperty({
    tags: {
      name: $localize`Video`,
      priority: ConfigPriority.advanced
    }
  })
  Video: ClientVideoConfig = new ClientVideoConfig();
  @ConfigProperty({
    tags: {
      name: $localize`Photo`,
      priority: ConfigPriority.advanced
    }
  })
  Photo: ClientPhotoConfig = new ClientPhotoConfig();
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientMetaFileConfig {
  @ConfigProperty({
    tags: {
      name: $localize`*.gpx files`,
      priority: ConfigPriority.advanced,
      uiResetNeeded: {db: true},
      uiDisabled: (sb, c) => !c.Map.enabled
    } as TAGS,
    description: $localize`Reads *.gpx files and renders them on the map.`
  })
  gpx: boolean = true;

  @ConfigProperty({
    tags: {
      name: $localize`GPX compression`,
      priority: ConfigPriority.advanced,
      uiDisabled: (sb, c) => !c.Map.enabled || !sb.gpx
    } as TAGS
  })
  GPXCompressing: ClientGPXCompressingConfig = new ClientGPXCompressingConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Markdown files`,
      uiResetNeeded: {db: true},
      priority: ConfigPriority.advanced
    },
    description: $localize`Reads *.md files in a directory and shows the next to the map.`
  })
  markdown: boolean = true;

  @ConfigProperty({
    tags: {
      name: $localize`*.pg2conf files`,
      uiResetNeeded: {db: true},
      priority: ConfigPriority.advanced
    },
    description: $localize`Reads *.pg2conf files (You can use it for custom sorting and saved search (albums)).`
  })
  pg2conf: boolean = true;
  @ConfigProperty({
    arrayType: 'string',
    tags: {
      name: $localize`Supported formats`,
      uiResetNeeded: {db: true},
      priority: ConfigPriority.underTheHood
    },
    description: $localize`The app will read and process these files.`
  })
  supportedFormats: string[] = ['gpx', 'pg2conf', 'md'];
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientFacesConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Enabled`,
      priority: ConfigPriority.advanced,
      uiResetNeeded: {db: true}
    }
  })
  enabled: boolean = true;
  @ConfigProperty({
    tags: {
      name: $localize`Override keywords`,
      priority: ConfigPriority.underTheHood,
      uiResetNeeded: {db: true}
    } as TAGS,
    description: $localize`If a photo has the same face (person) name and keyword, the app removes the duplicate, keeping the face only.`
  })
  keywordsToPersons: boolean = true;
  @ConfigProperty({
    type: UserRoles, tags: {
      name: $localize`Face starring right`,
      priority: ConfigPriority.underTheHood
    },
    description: $localize`Required minimum right to star (favourite) a face.`
  })
  writeAccessMinRole: UserRoles = UserRoles.Admin;
  @ConfigProperty({
    type: UserRoles, tags: {
      name: $localize`Face listing right`,
      priority: ConfigPriority.underTheHood
    },
    description: $localize`Required minimum right to show the faces tab.`
  })
  readAccessMinRole: UserRoles = UserRoles.User;
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientServiceConfig {

  @ConfigProperty({
    tags: {
      name: $localize`Page title`
    } as TAGS
  })
  applicationTitle: string = 'PiGallery 2';

  @ConfigProperty({
    description: $localize`If you access the page form local network its good to know the public url for creating sharing link.`,
    tags: {
      name: $localize`Page public url`,
      hint: typeof window !== 'undefined' ? window?.origin : '',
      uiOptional: true
    } as TAGS
  })
  publicUrl: string = '';

  @ConfigProperty({
    description: $localize`If you access the gallery under a sub url (like: http://mydomain.com/myGallery), set it here. If it is not working you might miss the '/' from the beginning of the url.`,
    tags: {
      name: $localize`Url Base`,
      hint: '/myGallery',
      uiResetNeeded: {server: true},
      priority: ConfigPriority.advanced,
      uiOptional: true
    }
  })
  urlBase: string = '';

  @ConfigProperty({
    description: 'PiGallery api path.',
    tags: {
      name: $localize`Api path`,
      uiResetNeeded: {server: true},
      priority: ConfigPriority.underTheHood
    }
  })
  apiPath: string = '/pgapi';

  @ConfigProperty({arrayType: 'string', volatile: true})
  languages: string[] | undefined;

  @ConfigProperty({
    description: $localize`Injects the content of this between the <head></head> HTML tags of the app. (You can use it add analytics or custom code to the app).`,
    tags: {
      name: $localize`Custom HTML Head`,
      priority: ConfigPriority.advanced,
      uiResetNeeded: {server: true},
      githubIssue: 404,
      uiOptional: true
    }
  })
  customHTMLHead: string = '';
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class ClientUserConfig {

  @ConfigProperty<boolean, ClientConfig>({
    onNewValue: (value, config) => {
      if (config && value === false) {
        config.Sharing.enabled = false;
      }
    },
    tags: {
      uiResetNeeded: {server: true},
      name: $localize`Password protection`,
    },
    description: $localize`Enables user management with login to password protect the gallery.`,
  })
  authenticationRequired: boolean = true;

  @ConfigProperty({
    type: UserRoles, tags: {
      name: $localize`Default user right`,
      priority: ConfigPriority.advanced,
      uiResetNeeded: {server: true},
      relevant: (c: any) => c.authenticationRequired === false
    },
    description: $localize`Default user right when password protection is disabled.`,
  })
  unAuthenticatedUserRole: UserRoles = UserRoles.Admin;
}


@SubConfigClass<TAGS>({tags: {client: true}, softReadonly: true})
export class ClientConfig {

  @ConfigProperty()
  Server: ClientServiceConfig = new ClientServiceConfig();

  @ConfigProperty()
  Users: ClientUserConfig = new ClientUserConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Gallery`,
      uiIcon: 'browser'
    } as TAGS,
  })
  Gallery: ClientGalleryConfig = new ClientGalleryConfig();

  @ConfigProperty()
  Media: ClientMediaConfig = new ClientMediaConfig();

  @ConfigProperty()
  MetaFile: ClientMetaFileConfig = new ClientMetaFileConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Album`,
      uiIcon: 'grid-two-up',
      uiJob: [{
        job: DefaultsJobs[DefaultsJobs['Album Reset']],
        hideProgress: true
      }]
    } as TAGS,
  })
  Album: ClientAlbumConfig = new ClientAlbumConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Search`,
      uiIcon: 'magnifying-glass'
    } as TAGS,
  })
  Search: ClientSearchConfig = new ClientSearchConfig();

  @ConfigProperty()
  Sharing: ClientSharingConfig = new ClientSharingConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Map`,
      uiIcon: 'map-marker'
    } as TAGS,
  })
  Map: ClientMapConfig = new ClientMapConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Faces`,
      uiIcon: 'people'
    } as TAGS,
  })
  Faces: ClientFacesConfig = new ClientFacesConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Random photo`,
      uiIcon: 'random',
      githubIssue: 392
    } as TAGS,
    description: $localize`This feature enables you to generate 'random photo' urls. That URL returns a photo random selected from your gallery. You can use the url with 3rd party application like random changing desktop background. Note: With the current implementation, random link also requires login.`
  })
  RandomPhoto: ClientRandomPhotoConfig = new ClientRandomPhotoConfig();
}
