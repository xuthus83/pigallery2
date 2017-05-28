export enum DatabaseType{
    memory = 0, mysql = 1
}

interface MySQLConfig {
    host: string;
    database: string;
    username: string;
    password: string;
}
interface DataBaseConfig {
    type: DatabaseType;
    mysql?: MySQLConfig;
}
interface ThumbnailConfig {
    folder: string;
    hardwareAcceleration: boolean;
}

interface ServerConfig {
    port: number;
    imagesFolder: string;
    thumbnail: ThumbnailConfig;
    database: DataBaseConfig;
}

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
export class ConfigClass {

    public Server: ServerConfig = null;

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

    public setDatabaseType(type: DatabaseType) {
        this.Server.database.type = type;
        if (type === DatabaseType.memory) {
            this.Client.Search.searchEnabled = false;
            this.Client.Search.instantSearchEnabled = false;
            this.Client.Search.autocompleteEnabled = false;
        }
    }
}

 