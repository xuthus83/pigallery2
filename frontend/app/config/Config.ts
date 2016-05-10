import {ConfigClass} from "../../../common/config/Config";
import {Utils} from "../../../common/Utils";

declare module ServerInject {
    export var ConfigInject;
}

export var Config = new ConfigClass();

if (typeof ServerInject !== "undefined" && typeof ServerInject.ConfigInject !== "undefined") {
    Utils.updateKeys(Config.Client, ServerInject.ConfigInject);
}