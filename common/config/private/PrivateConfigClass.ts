import {PublicConfigClass} from "../public/ConfigClass";
import {DatabaseType, IPrivateConfig, ServerConfig, ThumbnailProcessingLib} from "./IPrivateConfig";
import * as path from "path";
import {ConfigLoader} from "typeconfig";

/**
 * This configuration will be only at backend
 */
export class PrivateConfigClass extends PublicConfigClass implements IPrivateConfig {

  public Server: ServerConfig = {
    port: 80,
    imagesFolder: "demo/images",
    thumbnail: {
      folder: "demo/TEMP",
      processingLibrary: ThumbnailProcessingLib.sharp,
      qualityPriority: true
    },
    sessionTimeout: 1000 * 60 * 60 * 24 * 7,
    database: {
      type: DatabaseType.mysql,
      mysql: {
        host: "",
        username: "",
        password: "",
        database: ""

      }
    },
    sharing: {
      updateTimeout: 1000 * 60 * 5
    },
    enableThreading: true
  };
  private ConfigLoader: any;

  public setDatabaseType(type: DatabaseType) {
    this.Server.database.type = type;
    if (type === DatabaseType.memory) {
      this.Client.Search.enabled = false;
      this.Client.Sharing.enabled = false;
    }
  }

  public load() {
    ConfigLoader.loadBackendConfig(this,
      path.join(__dirname, './../../../config.json'),
      [["PORT", "Server-port"]]);

  }

  public save() {
    ConfigLoader.saveConfigFile(path.join(__dirname, './../../../config.json'), this);
  }

  public original(): PrivateConfigClass {
    let cfg = new PrivateConfigClass();
    cfg.load();
    return cfg;
  }
}

