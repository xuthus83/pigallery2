import * as path from "path";
import {Config} from "./config/Config";

class ProjectPathClass {
    public Root:string;
    public ImageFolder:string;
    public ThumbnailFolder:string;

    constructor() {
        this.Root = path.join(__dirname, "/../");
        this.ImageFolder = path.join(this.Root, Config.Server.imagesFolder);
        this.ThumbnailFolder = path.join(this.Root, Config.Server.thumbnailFolder);
    }
}

export var ProjectPath = new ProjectPathClass();