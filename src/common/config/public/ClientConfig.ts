/* eslint-disable @typescript-eslint/no-inferrable-types */
import 'reflect-metadata';
import {SortingByTypes, SortingMethod} from '../../entities/SortingMethods';
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
  basic = 1, advanced, underTheHood
}


export enum ThemeModes {
  light = 1, dark, auto
}

export enum ScrollUpModes {
  never = 1, mobileOnly, always
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
  uiType?: 'SearchQuery' | 'ThemeSelector' | 'SelectedThemeSettings' | 'SVGIconConfig', // Hint for the UI about the type
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
export class AutoCompleteItemsPerCategoryConfig {
  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Maximum items`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown at once. If there is not enough items to reach this value, it takes upto double of the individual items.`
  })
  maxItems: number = 20;

  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Max photo items`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown per photo category.`
  })
  fileName: number = 2;

  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Max directory items`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown per directory category.`
  })
  directory: number = 2;

  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Max caption items`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown per caption category.`
  })
  caption: number = 3;

  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Max position items`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown per position category.`
  })
  position: number = 3;

  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Max faces items`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown per faces category.`
  })
  person: number = 5;

  @ConfigProperty({
    type: 'unsignedInt',
    tags:
      {
        name: $localize`Max keyword items`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown per keyword category.`
  })
  keyword: number = 5;
}

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
    tags:
      {
        name: $localize`Max items per category`,
        priority: ConfigPriority.underTheHood
      },
    description: $localize`Maximum number autocomplete items shown per category.`
  })
  ItemsPerCategory: AutoCompleteItemsPerCategoryConfig = new AutoCompleteItemsPerCategoryConfig();

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
  @ConfigProperty({
    tags:
      {
        priority: ConfigPriority.advanced,
      },
    description: $localize`Sets if the layer is dark (used as default in the dark mode).`,
  })
  darkLayer: boolean = false;
}


@SubConfigClass({tags: {client: true}, softReadonly: true})
export class SVGIconConfig {

  constructor(viewBox: string = '0 0 512 512', items: string = '') {
    this.viewBox = viewBox;
    this.items = items;
  }

  @ConfigProperty({
    tags: {
      name: $localize`SVG icon viewBox`,
      priority: ConfigPriority.advanced
    },
    description: $localize`SVG path viewBox. See: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox`,
  })
  viewBox: string = '0 0 512 512';

  @ConfigProperty({
    tags: {
      name: $localize`SVG Items`,
      priority: ConfigPriority.advanced
    },
    description: $localize`Content elements (paths, circles, rects) of the SVG icon. Icons used on the map: fontawesome.com/icons.`,
  })
  items: string = '';
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class PathThemeConfig {


  constructor(color: string = '', dashArray: string = '', svgIcon: SVGIconConfig = new SVGIconConfig()) {
    this.color = color;
    this.dashArray = dashArray;
    this.svgIcon = svgIcon;
  }

  @ConfigProperty({
    tags: {
      name: $localize`Color`,
      priority: ConfigPriority.advanced
    },
    description: $localize`Color of the path. Use any valid css colors.`,
  })
  color: string = '';

  @ConfigProperty({
    tags: {
      name: $localize`Dash pattern`,
      priority: ConfigPriority.advanced,
      uiOptions: ['', '4', '4 1', '4 8', '4 1 2', '0 4 0', '4 1 2 3'],
    },
    description: $localize`Dash pattern of the path. Represents the spacing and length of the dash. Read more about dash array at: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray.`,
  })
  dashArray: string = '';


  @ConfigProperty({
    type: SVGIconConfig,
    tags: {
      name: $localize`Svg Icon`,
      uiType: 'SVGIconConfig',
      priority: ConfigPriority.advanced
    } as TAGS,
    description: $localize`Set the icon of the map marker pin.`,
  })
  svgIcon: SVGIconConfig = new SVGIconConfig();
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class MapPathGroupThemeConfig {


  constructor(matchers: string[] = [], theme: PathThemeConfig = new PathThemeConfig()) {
    this.matchers = matchers;
    this.theme = theme;
  }


  @ConfigProperty({
    arrayType: 'string',
    tags: {
      name: $localize`Matchers`,
      priority: ConfigPriority.advanced
    },
    description: $localize`List of regex string to match the name of the path. Case insensitive. Empty list matches everything.`,
  })
  matchers: string[] = [];

  @ConfigProperty({
    type: PathThemeConfig,
    tags: {
      name: $localize`Path and icon theme`,
      priority: ConfigPriority.advanced
    },
    description: $localize`List of regex string to match the name of the path.`,
  })
  theme: PathThemeConfig = new PathThemeConfig();
}

@SubConfigClass({tags: {client: true}, softReadonly: true})
export class MapPathGroupConfig {


  constructor(name: string = '', matchers: MapPathGroupThemeConfig[] = []) {
    this.name = name;
    this.matchers = matchers;
  }

  @ConfigProperty({
    tags: {
      name: $localize`Name`,
      priority: ConfigPriority.advanced
    },
    description: $localize`Name of the marker and path group on the map.`,
  })
  name: string = '';

  @ConfigProperty({
    arrayType: MapPathGroupThemeConfig,
    tags: {
      name: $localize`Path themes`,
      priority: ConfigPriority.advanced
    },
    description: $localize`Matchers for a given map and path theme.`,
  })
  matchers: MapPathGroupThemeConfig[] = [];
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


  @ConfigProperty({
    arrayType: MapPathGroupConfig,
    tags: {
      name: $localize`Path theme groups`,
      githubIssue: 647,
      priority: ConfigPriority.underTheHood
    } as TAGS,
    description: $localize`Markers are grouped and themed by these settings`,
  })
  MapPathGroupConfig: MapPathGroupConfig[] = [
    new MapPathGroupConfig('Transportation',
      [new MapPathGroupThemeConfig(
        ['flight', 'flying'],
        new PathThemeConfig('var(--bs-orange)',
          '4 8',
          new SVGIconConfig('0 0 567 512', '<path d="M482.3 192c34.2 0 93.7 29 93.7 64c0 36-59.5 64-93.7 64l-116.6 0L265.2 495.9c-5.7 10-16.3 16.1-27.8 16.1l-56.2 0c-10.6 0-18.3-10.2-15.4-20.4l49-171.6L112 320 68.8 377.6c-3 4-7.8 6.4-12.8 6.4l-42 0c-7.8 0-14-6.3-14-14c0-1.3 .2-2.6 .5-3.9L32 256 .5 145.9c-.4-1.3-.5-2.6-.5-3.9c0-7.8 6.3-14 14-14l42 0c5 0 9.8 2.4 12.8 6.4L112 192l102.9 0-49-171.6C162.9 10.2 170.6 0 181.2 0l56.2 0c11.5 0 22.1 6.2 27.8 16.1L365.7 192l116.6 0z"/>')
        )
      ), new MapPathGroupThemeConfig(
        ['drive', 'driving'],
        new PathThemeConfig('var(--bs-orange)',
          '4 8',
          new SVGIconConfig('0 0 640 512', '<path d="M171.3 96H224v96H111.3l30.4-75.9C146.5 104 158.2 96 171.3 96zM272 192V96h81.2c9.7 0 18.9 4.4 25 12l67.2 84H272zm256.2 1L428.2 68c-18.2-22.8-45.8-36-75-36H171.3c-39.3 0-74.6 23.9-89.1 60.3L40.6 196.4C16.8 205.8 0 228.9 0 256V368c0 17.7 14.3 32 32 32H65.3c7.6 45.4 47.1 80 94.7 80s87.1-34.6 94.7-80H385.3c7.6 45.4 47.1 80 94.7 80s87.1-34.6 94.7-80H608c17.7 0 32-14.3 32-32V320c0-65.2-48.8-119-111.8-127zM434.7 368a48 48 0 1 1 90.5 32 48 48 0 1 1 -90.5-32zM160 336a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>')
        )
      ), new MapPathGroupThemeConfig(
        ['ship', 'sailing', 'cruise'],
        new PathThemeConfig('var(--bs-orange)',
          '4 8',
          new SVGIconConfig('0 0 576 512', '<path d="M256 16c0-7 4.5-13.2 11.2-15.3s13.9 .4 17.9 6.1l224 320c3.4 4.9 3.8 11.3 1.1 16.6s-8.2 8.6-14.2 8.6H272c-8.8 0-16-7.2-16-16V16zM212.1 96.5c7 1.9 11.9 8.2 11.9 15.5V336c0 8.8-7.2 16-16 16H80c-5.7 0-11-3-13.8-8s-2.9-11-.1-16l128-224c3.6-6.3 11-9.4 18-7.5zM5.7 404.3C2.8 394.1 10.5 384 21.1 384H554.9c10.6 0 18.3 10.1 15.4 20.3l-4 14.3C550.7 473.9 500.4 512 443 512H133C75.6 512 25.3 473.9 9.7 418.7l-4-14.3z"/>')
        )
      )]),
    new MapPathGroupConfig('Sport',
      [new MapPathGroupThemeConfig(
        ['run'],
        new PathThemeConfig('var(--bs-primary)',
          '',
          new SVGIconConfig('0 0 417 512', '<path d="M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H362.7c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h69.6c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z"/>')
        )
      ), new MapPathGroupThemeConfig(
        ['walk'],
        new PathThemeConfig('var(--bs-primary)',
          '',
          new SVGIconConfig('0 0 320 512', '<path d="M160 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM126.5 199.3c-1 .4-1.9 .8-2.9 1.2l-8 3.5c-16.4 7.3-29 21.2-34.7 38.2l-2.6 7.8c-5.6 16.8-23.7 25.8-40.5 20.2s-25.8-23.7-20.2-40.5l2.6-7.8c11.4-34.1 36.6-61.9 69.4-76.5l8-3.5c20.8-9.2 43.3-14 66.1-14c44.6 0 84.8 26.8 101.9 67.9L281 232.7l21.4 10.7c15.8 7.9 22.2 27.1 14.3 42.9s-27.1 22.2-42.9 14.3L247 287.3c-10.3-5.2-18.4-13.8-22.8-24.5l-9.6-23-19.3 65.5 49.5 54c5.4 5.9 9.2 13 11.2 20.8l23 92.1c4.3 17.1-6.1 34.5-23.3 38.8s-34.5-6.1-38.8-23.3l-22-88.1-70.7-77.1c-14.8-16.1-20.3-38.6-14.7-59.7l16.9-63.5zM68.7 398l25-62.4c2.1 3 4.5 5.8 7 8.6l40.7 44.4-14.5 36.2c-2.4 6-6 11.5-10.6 16.1L54.6 502.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L68.7 398z"/>')
        )
      ), new MapPathGroupThemeConfig(
        ['hike', 'hiking'],
        new PathThemeConfig('var(--bs-primary)',
          '',
          new SVGIconConfig('0 0 384 512', '<path d="M192 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm51.3 182.7L224.2 307l49.7 49.7c9 9 14.1 21.2 14.1 33.9V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V397.3l-73.9-73.9c-15.8-15.8-22.2-38.6-16.9-60.3l20.4-84c8.3-34.1 42.7-54.9 76.7-46.4c19 4.8 35.6 16.4 46.4 32.7L305.1 208H336V184c0-13.3 10.7-24 24-24s24 10.7 24 24v55.8c0 .1 0 .2 0 .2s0 .2 0 .2V488c0 13.3-10.7 24-24 24s-24-10.7-24-24V272H296.6c-16 0-31-8-39.9-21.4l-13.3-20zM81.1 471.9L117.3 334c3 4.2 6.4 8.2 10.1 11.9l41.9 41.9L142.9 488.1c-4.5 17.1-22 27.3-39.1 22.8s-27.3-22-22.8-39.1zm55.5-346L101.4 266.5c-3 12.1-14.9 19.9-27.2 17.9l-47.9-8c-14-2.3-22.9-16.3-19.2-30L31.9 155c9.5-34.8 41.1-59 77.2-59h4.2c15.6 0 27.1 14.7 23.3 29.8z"/>')
        )
      ), new MapPathGroupThemeConfig(
        ['bike', 'biking', 'cycling'],
        new PathThemeConfig('var(--bs-primary)',
          '',
          new SVGIconConfig('0 0 640 512', '<path d="M400 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm27.2 64l-61.8-48.8c-17.3-13.6-41.7-13.8-59.1-.3l-83.1 64.2c-30.7 23.8-28.5 70.8 4.3 91.6L288 305.1V416c0 17.7 14.3 32 32 32s32-14.3 32-32V288c0-10.7-5.3-20.7-14.2-26.6L295 232.9l60.3-48.5L396 217c5.7 4.5 12.7 7 20 7h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H427.2zM56 384a72 72 0 1 1 144 0A72 72 0 1 1 56 384zm200 0A128 128 0 1 0 0 384a128 128 0 1 0 256 0zm184 0a72 72 0 1 1 144 0 72 72 0 1 1 -144 0zm200 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/>')
        )
      ), new MapPathGroupThemeConfig(
        ['skiing', 'ski'],
        new PathThemeConfig('var(--bs-primary)',
          '',
          new SVGIconConfig('0 0 512 512', '<path d="M380.7 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM2.7 268.9c6.1-11.8 20.6-16.3 32.4-10.2L232.7 361.3l46.2-69.2-75.1-75.1c-14.6-14.6-20.4-33.9-18.4-52.1l108.8 52 39.3 39.3c16.2 16.2 18.7 41.5 6 60.6L289.8 391l128.7 66.8c13.6 7.1 29.8 7.2 43.6 .3l15.2-7.6c11.9-5.9 26.3-1.1 32.2 10.7s1.1 26.3-10.7 32.2l-15.2 7.6c-27.5 13.7-59.9 13.5-87.2-.7L12.9 301.3C1.2 295.2-3.4 280.7 2.7 268.9zM118.9 65.6L137 74.2l8.7-17.4c4-7.9 13.6-11.1 21.5-7.2s11.1 13.6 7.2 21.5l-8.5 16.9 54.7 26.2c1.5-.7 3.1-1.4 4.7-2.1l83.4-33.4c34.2-13.7 72.8 4.2 84.5 39.2l17.1 51.2 52.1 26.1c15.8 7.9 22.2 27.1 14.3 42.9s-27.1 22.2-42.9 14.3l-58.1-29c-11.4-5.7-20-15.7-24.1-27.8l-5.8-17.3-27.3 12.1-6.8 3-6.7-3.2L151.5 116.7l-9.2 18.4c-4 7.9-13.6 11.1-21.5 7.2s-11.1-13.6-7.2-21.5l9-18-17.6-8.4c-8-3.8-11.3-13.4-7.5-21.3s13.4-11.3 21.3-7.5z"/>')
        )
      )]),
    new MapPathGroupConfig('Other paths',
      [new MapPathGroupThemeConfig(
        [], // Match all
        new PathThemeConfig('var(--bs-secondary)')
      )])
  ];
  @ConfigProperty({
    type: 'positiveFloat',
    tags: {
      name: $localize`Bend long path trigger`,
      priority: ConfigPriority.underTheHood
    } as TAGS,
    description: $localize`Map will bend the path if two points are this far apart on latititude axes. This intended to bend flight if only the end and the start points are given.`,
  })
  bendLongPathsTrigger: number = 0.5;
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
      name: $localize`Navbar show delay`,
      priority: ConfigPriority.underTheHood
    },
    type: 'positiveFloat',
    description: $localize`Ratio of the page height, you need to scroll to show the navigation bar.`,
  })
  NavbarShowDelay: number = 0.30;
  @ConfigProperty({
    tags: {
      name: $localize`Navbar hide delay`,
      priority: ConfigPriority.underTheHood
    },
    type: 'positiveFloat',
    description: $localize`Ratio of the page height, you need to scroll to hide the navigation bar.`,
  })
  NavbarHideDelay: number = 0.15;

  @ConfigProperty({
    tags: {
      name: $localize`Show scroll up button`,
      priority: ConfigPriority.underTheHood
    },
    type: ScrollUpModes,
    description: $localize`Set when the floating scroll-up button should be visible.`,
  })
  showScrollUpButton: ScrollUpModes = ScrollUpModes.mobileOnly;

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
export class ThemeConfig {

  constructor(name?: string, theme?: string) {
    this.name = name;
    this.theme = theme;
  }

  @ConfigProperty({
    tags: {
      name: $localize`Name`,
    } as TAGS,
    description: $localize`Name of the theme`
  })
  name: string;
  @ConfigProperty({
    tags: {
      name: $localize`Theme`,
    } as TAGS,
    description: $localize`Adds these css settings as it is to the end of the body tag of the page.`
  })
  theme: string;
}

@SubConfigClass<TAGS>({tags: {client: true}, softReadonly: true})
export class ThemesConfig {

  @ConfigProperty({
    tags: {
      name: $localize`Enable`,
      githubIssue: 642
    } as TAGS,
    description: $localize`Enable themes and color modes.`
  })
  enabled: boolean = true;

  @ConfigProperty({
    type: ThemeModes,
    tags: {
      name: $localize`Default theme mode`,
      uiDisabled: (sb: ThemesConfig) => !sb.enabled,
    } as TAGS,
    description: $localize`Sets the default theme mode that is used for the application.`
  })
  defaultMode: ThemeModes = ThemeModes.auto;

  @ConfigProperty({
    type: 'string',
    tags: {
      name: $localize`Selected theme`,
      uiDisabled: (sb: ThemesConfig) => !sb.enabled,
      uiType: 'ThemeSelector'
    } as TAGS,
    description: $localize`Selected theme to use on the site.`
  })
  selectedTheme: 'default' | string = 'classic';

  @ConfigProperty({
    arrayType: ThemeConfig,
    tags: {
      name: $localize`Selected theme css`, //this is a 'hack' to the UI settings. UI will only show the selected setting's css
      uiDisabled: (sb: ThemesConfig) => !sb.enabled,
      relevant: (c: ThemesConfig) => c.selectedTheme !== 'default',
      uiType: 'SelectedThemeSettings'
    } as TAGS,
    description: $localize`Adds these css settings as it is to the end of the body tag of the page.`
  })
  availableThemes: ThemeConfig[] = [
    new ThemeConfig(
      'classic',
      ':root nav.navbar {\n' +
      '--bs-navbar-color: rgba(255, 255, 255, 0.55);\n' +
      '--bs-navbar-hover-color: rgba(255, 255, 255, 0.75);\n' +
      '--bs-navbar-disabled-color: rgba(255, 255, 255, 0.25);\n' +
      '--bs-navbar-active-color: #fff;\n' +
      '--bs-navbar-brand-color: #fff;\n' +
      '--bs-navbar-brand-hover-color: #fff;\n' +
      '--bs-bg-opacity: 1;\n' +
      'background-color: rgba(var(--bs-dark-rgb), var(--bs-bg-opacity)) !important;\n' +
      '}'
    )];
}

@SubConfigClass<TAGS>({tags: {client: true}, softReadonly: true})
export class ClientSortingConfig implements SortingMethod {


  constructor(method: SortingByTypes = SortingByTypes.Date, ascending: boolean = true) {
    this.method = method;
    this.ascending = ascending;
  }

  @ConfigProperty({
    type: SortingByTypes,
    tags: {
      name: $localize`Method`,
    },
  })
  method: SortingByTypes = SortingByTypes.Date;

  @ConfigProperty({
    tags: {
      name: $localize`Ascending`,
    },
  })
  ascending: boolean = true;
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
    type: ClientSortingConfig,
    tags: {
      name: $localize`Default sorting`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Default sorting method for photo and video in a directory results.`
  })
  defaultPhotoSortingMethod: ClientSortingConfig = new ClientSortingConfig(SortingByTypes.Date, true);

  @ConfigProperty({
    type: ClientSortingConfig,
    tags: {
      name: $localize`Default search sorting`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Default sorting method for photo and video in a search results.`
  })
  defaultSearchSortingMethod: ClientSortingConfig = new ClientSortingConfig(SortingByTypes.Date, false);

  @ConfigProperty({
    type: ClientSortingConfig,
    tags: {
      name: $localize`Default grouping`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Default grouping method for photo and video in a directory results.`
  })
  defaultPhotoGroupingMethod: ClientSortingConfig = new ClientSortingConfig(SortingByTypes.Date, true);

  @ConfigProperty({
    type: ClientSortingConfig,
    tags: {
      name: $localize`Default search grouping`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Default grouping method for photo and video in a search results.`
  })
  defaultSearchGroupingMethod: ClientSortingConfig = new ClientSortingConfig(SortingByTypes.Date, false);

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

  @ConfigProperty({
    tags: {
      name: $localize`Themes`,
      uiIcon: 'ionBrushOutline',
      priority: ConfigPriority.advanced,
    } as TAGS,
    description: $localize`Pigallery2 uses Bootstrap 5.3 (https://getbootstrap.com/docs/5.3) for design (css, layout). In dark mode it sets 'data-bs-theme="dark"' to the <html> to take advantage bootstrap's color modes. For theming, read more at: https://getbootstrap.com/docs/5.3/customize/color-modes/`
  })
  Themes: ThemesConfig = new ThemesConfig();
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


  @ConfigProperty({
    type: SVGIconConfig,
    tags: {
      name: $localize`Svg Icon`,
      uiType: 'SVGIconConfig',
      priority: ConfigPriority.advanced
    } as TAGS,
    description: $localize`Sets the icon of the app`,
  })
    // Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc.
  svgIcon: SVGIconConfig = new SVGIconConfig(`0 0 477 499`, '<path d="M 155.35742,0.00390625 C 146.61281,-0.1915882 141.85865,7.1383977 143.14453,16.320312 c -5.0253,3.656959 -10.19388,7.154243 -6.24023,19.222657 -4.58742,4.134618 -5.10913,10.348334 -1.48438,19.498047 -4.39129,6.589969 -3.11752,12.97335 1.03906,19.11914 -4.88894,9.502043 3.17276,19.21587 5.44141,22.466797 -1.04215,6.219617 -0.68308,12.564187 9.94922,20.162107 -1.11334,7.96369 17.46969,24.68425 49.38672,29.36328 H 178 c -13.66868,0 -25.89111,6.67485 -34.06445,16.20313 a 16.0016,16.0016 0 0 0 -1.375,1.85937 l -25.82032,40.79493 c -3.41044,3.783 -6.16959,5.14257 -8.74023,5.14257 v -8 a 16.0016,16.0016 0 0 0 -16,-16 H 68 a 16.0016,16.0016 0 0 0 -16,16 v 8 h -4 c -26.32005,0 -48,21.67996 -48,48 v 192 c 0,26.32005 21.67995,48 48,48 h 352 c 26.32004,0 48,-21.67995 48,-48 v -192 c 0,-26.32004 -21.67996,-48 -48,-48 h -23.6875 c 17.04885,-2.05421 38.71691,-6.88245 41.36719,-7.66406 5.93597,-1.75063 16.35217,-2.72159 19.07617,-13.05469 7.29184,-1.75112 12.51077,-5.64326 13.56641,-13.51367 8.81702,-4.37374 12.58585,-9.34023 11.94335,-15.48242 11.04731,-6.41398 9.54598,-12.47161 8.22461,-18.46094 9.46507,-7.95108 8.66073,-20.67384 -7.6289,-24.85742 -2.72434,-11.49263 -17.04464,-14.61067 -19.11719,-15.40625 -1.23779,-3.784976 -3.33435,-7.486341 -13.25,-9.947265 -4.02002,-7.852166 -11.25127,-9.491348 -19.37695,-9.611328 -5.85741,-9.79893 -13.48897,-6.624622 -20.65039,-7.099609 -8.94128,-7.153399 -12.98262,-3.637425 -18.66797,-3.646485 -10.18917,-6.600909 -15.55163,-2.868985 -22.91406,0.408203 l -6.18555,-2.476562 c -20.5054,3.29963 -36.41254,19.947419 -43.29688,28.99414 C 300.3379,87.00374 299.65558,63.987375 286.625,47.814453 l -6.25586,-2.298828 c -3.27756,-7.361507 -4.76501,-13.724233 -16.75391,-15.636719 -4.35547,-3.741368 -4.87931,-9.112389 -16.31054,-9.779297 -3.66374,-2.853493 -6.5025,-7.046842 -11.04492,-8.685547 -2.37733,-0.810817 -5.30428,-1.002428 -9.05469,0.142579 C 221.12157,6.1193673 214.61565,2.5886448 206.375,5.734375 197.35771,0.92758991 193.2688,2.1515051 189.87305,4.2617188 187.79957,3.4657811 175.073,-3.7994111 165.35742,2.9179688 c -3.72598,-1.9476418 -7.08512,-2.84889774 -10,-2.91406255 z M 174.69531,12.8125 c 9.42974,1.034007 17.26097,7.040581 22.90039,11.480469 3.75022,-1.147227 1.84818,-5.083236 -0.4707,-9.283203 6.92185,3.794618 12.88093,7.943992 18.05664,12.517578 4.22752,-1.584205 0.10517,-6.477376 -1.3457,-10.240235 10.47234,6.39897 14.1082,11.208133 17.74414,16.017579 4.6719,-1.929905 2.50013,-5.971958 1.22851,-9.666016 7.29758,6.317842 10.1592,12.071002 13.23438,17.802734 2.32923,-1.485964 5.35034,-2.082719 4.40234,-8.238281 4.72541,5.743934 7.76598,11.564823 9.3711,17.353516 4.59623,-0.926367 4.40009,-4.723694 5.50781,-7.609375 4.37291,7.471346 6.29681,14.312307 9.1582,21.410156 1.26719,-0.34049 2.97931,-2.372488 5.24414,-5.847656 9.46379,20.07914 16.80666,64.271234 -19.4375,66.804684 -18.0111,-31.222334 -43.25285,-58.701637 -73.4414,-83.529294 35.79308,39.599243 54.64246,67.832134 62.80859,88.861324 -18.21571,25.90026 -56.56689,12.62689 -70.13867,6.48633 3.27833,-0.18867 6.33675,-0.87772 8.04883,-2.91015 -2.63645,-3.9084 -15.72886,-6.44916 -22.58399,-14.46094 3.57887,0.64969 5.38753,0.51554 7.82031,-1.24024 -7.14411,-5.63766 -15.02532,-11.24903 -18.53711,-17.45898 2.79514,1.07296 5.1677,2.70872 9.74219,1.56836 -5.81449,-6.679382 -12.39086,-12.721695 -16.18164,-20.900391 3.82194,1.364266 7.8421,3.011798 9.56836,2.019531 -5.11422,-6.617289 -8.97266,-13.271346 -11.75781,-20.029297 4.9867,2.638313 7.44826,2.962242 9.05664,2.544922 -3.11038,-6.987779 -7.84999,-13.770266 -8.4375,-21.132813 3.35824,2.840122 6.79111,4.674664 10.13281,3.785157 -0.25957,-4.444198 -6.69731,-9.500747 -7.50976,-20.052735 4.00918,1.953514 8.12986,4.155617 9.37695,3.59961 1.04877,-8.388286 -0.62659,-13.997051 -2.08594,-19.626953 8.86885,3.30161 22.17671,8.513758 21.82227,7.550781 z m 188.53321,67.716797 c -1.14212,2.975311 -3.88443,5.541155 -0.99805,9.339844 5.06622,-3.227791 11.22108,-5.518343 18.57617,-6.625 -4.82336,3.940138 -3.06743,6.370748 -2.24023,9.068359 6.11963,-2.202174 12.06015,-4.471757 21.74609,-4.373047 -3.41775,1.893974 -7.73523,3.443581 -5.55469,8.003906 5.92019,-1.141186 11.83914,-2.283621 23.9043,-0.03125 -3.597,1.825165 -10.02271,2.669764 -7.84961,6.710941 6.81607,0.0297 14.14366,0.8774 21.79102,2.77929 -4.62322,1.53515 -8.57985,3.22205 -6.56055,6.58399 7.16177,0.47405 16.99969,1.2497 24.69922,6.79101 l -7.51953,3.42383 c -0.90776,0.47846 12.50527,5.4204 21.27148,8.99219 -4.97624,3.26125 -9.84918,6.25436 -14.68359,13.18945 0.55566,1.24802 5.08935,2.3671 9.375,3.59766 -7.6626,7.29873 -15.79539,6.66122 -18.9961,9.87891 1.85249,2.98728 5.5759,3.79555 10.0625,3.96679 -5.45459,5.04319 -13.42489,6.94692 -20.41211,10.0586 0.91602,1.38634 2.9633,2.7922 8.4336,4.16796 -6.5908,3.15887 -13.91116,5.52173 -22.13867,7.01758 0.65234,1.80252 4.70876,3.35918 8.46093,4.90235 -8.28972,3.54142 -17.21937,3.63006 -26.00976,4.70312 2.67177,3.81914 5.4929,4.28287 8.28711,5.35547 -6.76507,2.26504 -16.33859,1.07029 -25.45703,0.57031 0.59867,3.02228 1.88993,4.2431 4.98242,6.1543 -10.3997,1.49 -21.91879,-5.41355 -26.2793,-4.29492 -0.12334,2.74619 1.72225,5.21265 4.0332,7.54687 -14.19463,-4.51801 -51.45077,-20.37107 -47.7832,-51.75195 20.14179,-10.16277 53.00577,-18.44254 106.13672,-24.00977 -39.04834,-1.74998 -76.19215,1.7815 -110.4707,12.93164 -25.41865,-26.20363 9.6105,-54.131185 30.07812,-62.720699 -0.73188,4.063606 -0.7324,6.752209 -0.0176,7.853516 6.87584,-3.360081 12.88469,-7.154669 21.13282,-9.78125 z M 178,178.15234 h 92 c 3.36751,0 6.36235,1.38715 9.24805,4.51563 l 25.77148,40.7207 a 16.0016,16.0016 0 0 0 1.36914,1.85156 c 8.12427,9.48556 20.07929,16.91211 34.61133,16.91211 h 59 c 9.02603,0 16,6.97397 16,16 v 192 c 0,9.02603 -6.97397,16 -16,16 H 48 c -9.026034,0 -16,-6.97397 -16,-16 v -192 c 0,-9.02603 6.973966,-16 16,-16 h 60 c 14.52251,0 26.0798,-8.1186 33.61133,-16.91211 a 16.0016,16.0016 0 0 0 1.36914,-1.85156 l 25.77148,-40.7207 c 2.8857,-3.12848 5.88054,-4.51563 9.24805,-4.51563 z m 46,64 c -52.82972,0 -96,43.17029 -96,96 0,52.82972 43.17028,96 96,96 52.82972,0 96,-43.17028 96,-96 0,-52.82971 -43.17028,-96 -96,-96 z m 0,32 c 35.53566,0 64,28.46434 64,64 0,35.53568 -28.46434,64 -64,64 -35.53566,0 -64,-28.46432 -64,-64 0,-35.53566 28.46434,-64 64,-64 z"/>');
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
      uiIcon: 'ionBrowsersOutline'
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
      uiIcon: 'ionAlbumsOutline',
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
      uiIcon: 'ionSearchOutline'
    } as TAGS,
  })
  Search: ClientSearchConfig = new ClientSearchConfig();

  @ConfigProperty()
  Sharing: ClientSharingConfig = new ClientSharingConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Map`,
      uiIcon: 'ionLocationOutline'
    } as TAGS,
  })
  Map: ClientMapConfig = new ClientMapConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Faces`,
      uiIcon: 'ionPeopleOutline'
    } as TAGS,
  })
  Faces: ClientFacesConfig = new ClientFacesConfig();

  @ConfigProperty({
    tags: {
      name: $localize`Random photo`,
      uiIcon: 'ionShuffleOutline',
      githubIssue: 392
    } as TAGS,
    description: $localize`This feature enables you to generate 'random photo' urls. That URL returns a photo random selected from your gallery. You can use the url with 3rd party application like random changing desktop background. Note: With the current implementation, random link also requires login.`
  })
  RandomPhoto: ClientRandomPhotoConfig = new ClientRandomPhotoConfig();
}
