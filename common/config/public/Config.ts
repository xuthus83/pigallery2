import {PublicConfigClass} from "./ConfigClass";
import {WebConfigLoader} from "typeconfig/src/WebConfigLoader";


declare module ServerInject {
  export const ConfigInject;
}

export let Config = new PublicConfigClass();


if (typeof ServerInject !== "undefined" && typeof ServerInject.ConfigInject !== "undefined") {
  WebConfigLoader.loadFrontendConfig(Config.Client, ServerInject.ConfigInject);
}


if (Config.Client.publicUrl == "") {
  Config.Client.publicUrl = location.origin;
}

