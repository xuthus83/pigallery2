interface SearchConfig {
  searchEnabled: boolean
  instantSearchEnabled: boolean
  autocompleteEnabled: boolean
}

interface SharingConfig {
  enabled: boolean;
  passwordProtected: boolean;
}

interface ClientConfig {
  applicationTitle: string;
  iconSize: number;
  thumbnailSizes: Array<number>;
  Search: SearchConfig;
  Sharing: SharingConfig;
  concurrentThumbnailGenerations: number;
  enableCache: boolean;
  enableOnScrollRendering: boolean;
  enableOnScrollThumbnailPrioritising: boolean;
  authenticationRequired: boolean;
  googleApiKey: string;
}

/**
 * These configuration will be available at frontend and backend too
 */
export class PublicConfigClass {

  public Client: ClientConfig = {
    applicationTitle: "PiGallery 2",
    thumbnailSizes: [200, 400, 600],
    iconSize: 30,
    Search: {
      searchEnabled: true,
      instantSearchEnabled: true,
      autocompleteEnabled: true
    },
    Sharing: {
      enabled: true,
      passwordProtected: true
    },
    concurrentThumbnailGenerations: 1,
    enableCache: false,
    enableOnScrollRendering: true,
    enableOnScrollThumbnailPrioritising: true,
    authenticationRequired: true,
    googleApiKey: ""
  };

}

