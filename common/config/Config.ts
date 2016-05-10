export enum DatabaseType{
    memory, mongoDB
}

interface ServerConfig {
    port:number;
    thumbnailSizes:Array<number>;
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
    Search:SearchConfig;
}
export class ConfigClass {

    public Server:ServerConfig = null;

    public Client:ClientConfig = {
        Search: {
            searchEnabled: true,
            instantSearchEnabled: true,
            autocompleteEnabled: true
        }
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

 