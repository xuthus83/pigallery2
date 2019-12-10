import * as path from 'path';
import * as fs from 'fs';
import {Config} from '../common/config/private/Config';

class ProjectPathClass {
  public Root: string;
  public ImageFolder: string;
  public ThumbnailFolder: string;
  public TranscendedFolder: string;
  public FrontendFolder: string;

  constructor() {
    this.reset();
  }

  isAbsolutePath(pathStr: string) {
    return path.resolve(pathStr) === path.normalize(pathStr);
  }

  normalizeRelative(pathStr: string) {
    return path.join(pathStr, path.sep);
  }

  getAbsolutePath(pathStr: string): string {
    return this.isAbsolutePath(pathStr) ? pathStr : path.join(this.Root, pathStr);
  }

  getRelativePathToImages(pathStr: string): string {
    return path.relative(this.ImageFolder, pathStr);
  }

  reset() {
    this.Root = path.join(__dirname, '/../../');
    this.ImageFolder = this.getAbsolutePath(Config.Server.imagesFolder);
    this.ThumbnailFolder = this.getAbsolutePath(Config.Server.Thumbnail.folder);
    this.TranscendedFolder = path.join(this.ThumbnailFolder, 'tc');
    this.FrontendFolder = path.join(this.Root, 'dist');

    // create thumbnail folder if not exist
    if (!fs.existsSync(this.ThumbnailFolder)) {
      fs.mkdirSync(this.ThumbnailFolder);
    }

  }
}

export const ProjectPath = new ProjectPathClass();
