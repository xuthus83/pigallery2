import {ConfigLoader} from "./ConfigLoader";
import * as path from "path";
import {ConfigClass, DatabaseType} from "../../common/config/Config";

export let Config = new ConfigClass();

Config.Server = {
    port: 80,
    imagesFolder: "demo/images",
    thumbnail: {
        folder: "demo/TEMP",
        hardwareAcceleration: true
    },
    database: {
        type: DatabaseType.mysql,
        mysql: {
            host: "localhost",
            username: "root",
            password: "root",
            database: "pigallery2"

        }
    }
};

ConfigLoader.init(Config, path.join(__dirname, './../../config.json'), [["PORT", "Server-port"]]);

 