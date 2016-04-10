
import {ConfigLoader} from "./ConfigLoader";

export class ConfigClass{

    constructor(){
        ConfigLoader.init(this,__dirname+'./../../../config.json');
    }

    public thumbnailSizes = [200];
    public imagesFolder = "/demo/images";
    public thumbnailFolder = "/demo/TEMP";
}


export var Config = new ConfigClass();