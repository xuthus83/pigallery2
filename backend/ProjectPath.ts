import * as path from 'path';
import {Config} from '../common/config/private/Config';

class ProjectPathClass {
  public Root: string;
  public ImageFolder: string;
  public ThumbnailFolder: string;
  public FrontendFolder: string;

  isAbsolutePath(pathStr: string) {
    return path.resolve(pathStr) === path.normalize(pathStr);
  }

  normalizeRelative(pathStr: string) {
    return path.join(pathStr, path.sep);
  }

  getAbsolutePath(pathStr: string): string {
    return this.isAbsolutePath(pathStr) ? pathStr : path.join(this.Root, pathStr);
  }

  constructor() {
    this.reset();
  }

  reset() {
    this.Root = path.join(__dirname, '/../');
    this.ImageFolder = this.getAbsolutePath(Config.Server.imagesFolder);
    this.ThumbnailFolder = this.getAbsolutePath(Config.Server.thumbnail.folder);
    this.FrontendFolder = path.join(this.Root, 'dist');
  }
}

export const ProjectPath = new ProjectPathClass();
