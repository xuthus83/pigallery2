import {PublicConfigClass} from "../public/ConfigClass";
import {DatabaseType, ServerConfig, ThumbnailProcessingLib} from "./IPrivateConfig";


/**
 * This configuration will be only at backend
 */
export class PrivateConfigClass extends PublicConfigClass {

  public Server: ServerConfig = {
    port: 80,
    imagesFolder: "demo/images",
    thumbnail: {
      folder: "demo/TEMP",
      processingLibrary: ThumbnailProcessingLib.sharp,
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
    sharing: {
      updateTimeout: 1000 * 60 * 5
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

