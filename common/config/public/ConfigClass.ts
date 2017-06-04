interface SearchConfig {
    searchEnabled: boolean
    instantSearchEnabled: boolean
    autocompleteEnabled: boolean
}

interface ClientConfig {
    iconSize: number;
    thumbnailSizes: Array<number>;
    Search: SearchConfig;
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
        thumbnailSizes: [200, 400, 600],
        iconSize: 30,
        Search: {
            searchEnabled: true,
            instantSearchEnabled: true,
            autocompleteEnabled: true
        },
        concurrentThumbnailGenerations: 1,
        enableCache: false,
        enableOnScrollRendering: true,
        enableOnScrollThumbnailPrioritising: true,
        authenticationRequired: true,
        googleApiKey: ""
    };

}

