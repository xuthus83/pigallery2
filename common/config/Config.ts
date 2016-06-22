export enum DatabaseType{
    memory
}

interface ServerConfig {
    port:number;
    imagesFolder:string;
    thumbnailFolder:string;
    databaseType:DatabaseType;
}

interface SearchConfig {
    searchEnabled:boolean
    instantSearchEnabled:boolean
    autocompleteEnabled:boolean
}

interface ClientConfig {
    thumbnailSizes:Array<number>;
    Search:SearchConfig;
    concurrentThumbnailGenerations:number;
}
export class ConfigClass {

    public Server:ServerConfig = null;

    public Client:ClientConfig = {
        thumbnailSizes: [200, 400, 600],
        Search: {
            searchEnabled: false,
            instantSearchEnabled: false,
            autocompleteEnabled: false
        },
        concurrentThumbnailGenerations: 1
    };

    public setDatabaseType(type:DatabaseType) {
        this.Server.databaseType = type;
        if (type === DatabaseType.memory) {
            this.Client.Search.searchEnabled = false;
            this.Client.Search.instantSearchEnabled = false;
            this.Client.Search.autocompleteEnabled = false;
        }
    }
}

 