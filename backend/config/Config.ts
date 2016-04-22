
import {ConfigLoader} from "./ConfigLoader";

export enum DatabaseType{
    memory, mongoDB
}

export class ConfigClass{

    constructor(){
        ConfigLoader.init(this,__dirname+'./../../config.json');
    }

    public port:number = 80;

    public thumbnailSizes:Array<number> = [200];
    public imagesFolder:string = "/demo/images";
    public thumbnailFolder:string = "/demo/TEMP";
    public databaseType:DatabaseType = DatabaseType.mongoDB;
}


export var Config = new ConfigClass();