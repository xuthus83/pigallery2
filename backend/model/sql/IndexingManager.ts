import {IIndexingManager} from '../interfaces/IIndexingManager';
import {IndexingProgressDTO} from '../../../common/entities/settings/IndexingProgressDTO';
import {ObjectManagerRepository} from '../ObjectManagerRepository';
import {ISQLGalleryManager} from './IGalleryManager';
import * as path from 'path';
import {SQLConnection} from './SQLConnection';
import {DirectoryEntity} from './enitites/DirectoryEntity';
import {Logger} from '../../Logger';
import {RendererInput, ThumbnailSourceType, ThumbnailWorker} from '../threading/ThumbnailWorker';
import {Config} from '../../../common/config/private/Config';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {ProjectPath} from '../../ProjectPath';
import {ThumbnailGeneratorMWs} from '../../middlewares/thumbnail/ThumbnailGeneratorMWs';

const LOG_TAG = '[IndexingManager]';

export class IndexingManager implements IIndexingManager {
  directoriesToIndex: string[] = [];
  indexingProgress = null;
  enabled = false;
  private indexNewDirectory = async (createThumbnails: boolean = false) => {
    if (this.directoriesToIndex.length === 0) {
      this.indexingProgress = null;
      if (global.gc) {
        global.gc();
      }
      return;
    }
    const directory = this.directoriesToIndex.shift();
    this.indexingProgress.current = directory;
    this.indexingProgress.left = this.directoriesToIndex.length;
    const scanned = await (<ISQLGalleryManager>ObjectManagerRepository.getInstance().GalleryManager).indexDirectory(directory);
    if (this.enabled === false) {
      return;
    }
    this.indexingProgress.indexed++;
    for (let i = 0; i < scanned.directories.length; i++) {
      this.directoriesToIndex.push(path.join(scanned.directories[i].path, scanned.directories[i].name));
    }
    if (createThumbnails) {
      for (let i = 0; i < scanned.media.length; i++) {
        const media = scanned.media[i];
        const mPath = path.join(ProjectPath.ImageFolder, media.directory.path, media.directory.name, media.name);
        const thPath = path.join(ProjectPath.ThumbnailFolder,
          ThumbnailGeneratorMWs.generateThumbnailName(mPath, Config.Client.Thumbnail.thumbnailSizes[0]));
        await ThumbnailWorker.render(<RendererInput>{
          type: MediaDTO.isVideo(media) ? ThumbnailSourceType.Video : ThumbnailSourceType.Image,
          mediaPath: mPath,
          size: Config.Client.Thumbnail.thumbnailSizes[0],
          thPath: thPath,
          makeSquare: false,
          qualityPriority: Config.Server.thumbnail.qualityPriority
        }, Config.Server.thumbnail.processingLibrary);
      }

    }
    process.nextTick(() => {
      this.indexNewDirectory(createThumbnails);
    });
  };

  startIndexing(createThumbnails: boolean = false): void {
    if (this.directoriesToIndex.length === 0 && this.enabled === false) {
      Logger.info(LOG_TAG, 'Starting indexing');
      this.indexingProgress = <IndexingProgressDTO>{
        indexed: 0,
        left: 0,
        current: ''
      };
      this.directoriesToIndex.push('/');
      this.enabled = true;
      this.indexNewDirectory(createThumbnails);
    } else {
      Logger.info(LOG_TAG, 'Already indexing..');
    }
  }

  getProgress(): IndexingProgressDTO {
    return this.indexingProgress;
  }

  cancelIndexing(): void {
    Logger.info(LOG_TAG, 'Canceling indexing');
    this.directoriesToIndex = [];
    this.indexingProgress = null;
    this.enabled = false;
    if (global.gc) {
      global.gc();
    }
  }

  async reset(): Promise<void> {
    Logger.info(LOG_TAG, 'Resetting DB');
    this.directoriesToIndex = [];
    this.indexingProgress = null;
    this.enabled = false;
    const connection = await SQLConnection.getConnection();
    return connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder('directory')
      .delete()
      .execute().then(() => {
      });
  }
}
