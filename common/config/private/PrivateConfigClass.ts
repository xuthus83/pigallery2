import {PublicConfigClass} from "../public/ConfigClass";
import {DatabaseType, ServerConfig} from "./IPrivateConfig";


/**
 * This configuration will be only at backend
 */
export class PrivateConfigClass extends PublicConfigClass {

    public Server: ServerConfig = {
        port: 80,
        imagesFolder: "demo/images",
        thumbnail: {
            folder: "demo/TEMP",
            hardwareAcceleration: true,
            qualityPriority: true
        },
        database: {
            type: DatabaseType.mysql,
            mysql: {
                host: "localhost",
                username: "root",
                password: "root",
                database: "pigallery2"

            }
        },
        enableThreading: true
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

