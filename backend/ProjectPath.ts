import * as path from "path";
import {Config} from "./config/Config";

class ProjectPathClass {
    public Root:string;
    public ImageFolder:string;
    public ThumbnailFolder:string;

    isAbsolutePath(pathStr) {
        return path.resolve(pathStr) === path.normalize(pathStr).replace(RegExp(pathStr.sep + '$'), '');
    }

    constructor() {
        this.Root = path.join(__dirname, "/../");
        this.ImageFolder = this.isAbsolutePath(Config.Server.imagesFolder) ? Config.Server.imagesFolder : path.join(this.Root, Config.Server.imagesFolder);
        this.ThumbnailFolder = this.isAbsolutePath(Config.Server.thumbnailFolder) ? Config.Server.thumbnailFolder : path.join(this.Root, Config.Server.thumbnailFolder);
    }
}

export var ProjectPath = new ProjectPathClass();