import {ConfigLoader} from "./ConfigLoader";
import * as path from "path";
import {ConfigClass, DatabaseType} from "../../common/config/Config";

export let Config = new ConfigClass();

Config.Server = {
    port: 80,
    imagesFolder: "demo/images",
    thumbnailFolder: "demo/TEMP",
    databaseType: DatabaseType.memory
};

ConfigLoader.init(Config, path.join(__dirname, './../../config.json'), [["PORT", "Server-port"]]);

 