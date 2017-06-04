import * as path from "path";
import {Config} from "../common/config/private/Config";

class ProjectPathClass {
    public Root: string;
    public ImageFolder: string;
    public ThumbnailFolder: string;

    isAbsolutePath(pathStr: string) {
        return path.resolve(pathStr) === path.normalize(pathStr);
    }

    normalizeRelative(pathStr: string) {
        return path.join(pathStr, path.sep);
    }

    constructor() {
        this.Root = path.join(__dirname, "/../");
        this.ImageFolder = this.isAbsolutePath(Config.Server.imagesFolder) ? Config.Server.imagesFolder : path.join(this.Root, Config.Server.imagesFolder);
        this.ThumbnailFolder = this.isAbsolutePath(Config.Server.thumbnail.folder) ? Config.Server.thumbnail.folder : path.join(this.Root, Config.Server.thumbnail.folder);
    }
}

export let ProjectPath = new ProjectPathClass();