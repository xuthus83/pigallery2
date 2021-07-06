import {IUserManager} from './database/interfaces/IUserManager';
import {IGalleryManager} from './database/interfaces/IGalleryManager';
import {ISearchManager} from './database/interfaces/ISearchManager';
import {SQLConnection} from './database/sql/SQLConnection';
import {ISharingManager} from './database/interfaces/ISharingManager';
import {Logger} from '../Logger';
import {IIndexingManager} from './database/interfaces/IIndexingManager';
import {IPersonManager} from './database/interfaces/IPersonManager';
import {IVersionManager} from './database/interfaces/IVersionManager';
import {IJobManager} from './database/interfaces/IJobManager';
import {LocationManager} from './database/LocationManager';
import {IAlbumManager} from './database/interfaces/IAlbumManager';
import {JobManager} from './jobs/JobManager';
import {IPreviewManager} from './database/interfaces/IPreviewManager';

const LOG_TAG = '[ObjectManagers]';

export class ObjectManagers {

  private static instance: ObjectManagers = null;

  private galleryManager: IGalleryManager;
  private userManager: IUserManager;
  private searchManager: ISearchManager;
  private sharingManager: ISharingManager;
  private indexingManager: IIndexingManager;
  private personManager: IPersonManager;
  private previewManager: IPreviewManager;
  private versionManager: IVersionManager;
  private jobManager: IJobManager;
  private locationManager: LocationManager;
  private albumManager: IAlbumManager;


  get VersionManager(): IVersionManager {
    return this.versionManager;
  }

  set VersionManager(value: IVersionManager) {
    this.versionManager = value;
  }

  get LocationManager(): LocationManager {
    return this.locationManager;
  }

  set LocationManager(value: LocationManager) {
    this.locationManager = value;
  }

  get AlbumManager(): IAlbumManager {
    return this.albumManager;
  }

  set AlbumManager(value: IAlbumManager) {
    this.albumManager = value;
  }

  get PersonManager(): IPersonManager {
    return this.personManager;
  }

  set PersonManager(value: IPersonManager) {
    this.personManager = value;
  }
  get PreviewManager(): IPreviewManager {
    return this.previewManager;
  }

  set PreviewManager(value: IPreviewManager) {
    this.previewManager = value;
  }

  get IndexingManager(): IIndexingManager {
    return this.indexingManager;
  }

  set IndexingManager(value: IIndexingManager) {
    this.indexingManager = value;
  }


  get GalleryManager(): IGalleryManager {
    return this.galleryManager;
  }

  set GalleryManager(value: IGalleryManager) {
    this.galleryManager = value;
  }

  get UserManager(): IUserManager {
    return this.userManager;
  }

  set UserManager(value: IUserManager) {
    this.userManager = value;
  }

  get SearchManager(): ISearchManager {
    return this.searchManager;
  }

  set SearchManager(value: ISearchManager) {
    this.searchManager = value;
  }

  get SharingManager(): ISharingManager {
    return this.sharingManager;
  }

  set SharingManager(value: ISharingManager) {
    this.sharingManager = value;
  }

  get JobManager(): IJobManager {
    return this.jobManager;
  }

  set JobManager(value: IJobManager) {
    this.jobManager = value;
  }

  public static getInstance(): ObjectManagers {
    if (this.instance === null) {
      this.instance = new ObjectManagers();
    }
    return this.instance;
  }

  public static async reset(): Promise<void> {
    if (ObjectManagers.getInstance().IndexingManager &&
      ObjectManagers.getInstance().IndexingManager.IsSavingInProgress) {
      await ObjectManagers.getInstance().IndexingManager.SavingReady;
    }
    if (ObjectManagers.getInstance().JobManager) {
      ObjectManagers.getInstance().JobManager.stopSchedules();
    }
    await SQLConnection.close();
    this.instance = null;
    Logger.debug(LOG_TAG, 'Object manager reset');
  }


  public static async InitMemoryManagers(): Promise<void> {
    await ObjectManagers.reset();
    this.initManagers('memory');
    Logger.debug(LOG_TAG, 'Memory DB inited');
  }

  public static async InitSQLManagers(): Promise<void> {
    await ObjectManagers.reset();
    await SQLConnection.init();
    this.initManagers('sql');
    Logger.debug(LOG_TAG, 'SQL DB inited');
  }

  private static initManagers(type: 'memory' | 'sql'): void {
    ObjectManagers.getInstance().AlbumManager = new (require(`./database/${type}/AlbumManager`).AlbumManager)();
    ObjectManagers.getInstance().GalleryManager = new (require(`./database/${type}/GalleryManager`).GalleryManager)();
    ObjectManagers.getInstance().IndexingManager = new (require(`./database/${type}/IndexingManager`).IndexingManager)();
    ObjectManagers.getInstance().PersonManager = new (require(`./database/${type}/PersonManager`).PersonManager)();
    ObjectManagers.getInstance().PreviewManager = new (require(`./database/${type}/PreviewManager`).PreviewManager)();
    ObjectManagers.getInstance().SearchManager = new (require(`./database/${type}/SearchManager`).SearchManager)();
    ObjectManagers.getInstance().SharingManager = new (require(`./database/${type}/SharingManager`).SharingManager)();
    ObjectManagers.getInstance().UserManager = new (require(`./database/${type}/UserManager`).UserManager)();
    ObjectManagers.getInstance().VersionManager = new (require(`./database/${type}/VersionManager`).VersionManager)();
    ObjectManagers.getInstance().JobManager = new JobManager();
    ObjectManagers.getInstance().LocationManager = new LocationManager();
  }

}
