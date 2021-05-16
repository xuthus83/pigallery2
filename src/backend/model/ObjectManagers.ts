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

const LOG_TAG = '[ObjectManagers]';

export class ObjectManagers {

  private static instance: ObjectManagers = null;

  private galleryManager: IGalleryManager;
  private userManager: IUserManager;
  private searchManager: ISearchManager;
  private sharingManager: ISharingManager;
  private indexingManager: IIndexingManager;
  private personManager: IPersonManager;
  private versionManager: IVersionManager;
  private jobManager: IJobManager;
  private locationManager: LocationManager;


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

  get PersonManager(): IPersonManager {
    return this.personManager;
  }

  set PersonManager(value: IPersonManager) {
    this.personManager = value;
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
  }


  public static async InitCommonManagers(): Promise<void> {
    const JobManager = require('./jobs/JobManager').JobManager;
    ObjectManagers.getInstance().JobManager = new JobManager();
  }

  public static async InitMemoryManagers(): Promise<void> {
    await ObjectManagers.reset();
    const GalleryManager = require('./database/memory/GalleryManager').GalleryManager;
    const UserManager = require('./database/memory/UserManager').UserManager;
    const SearchManager = require('./database/memory/SearchManager').SearchManager;
    const SharingManager = require('./database/memory/SharingManager').SharingManager;
    const IndexingManager = require('./database/memory/IndexingManager').IndexingManager;
    const PersonManager = require('./database/memory/PersonManager').PersonManager;
    const VersionManager = require('./database/memory/VersionManager').VersionManager;
    ObjectManagers.getInstance().GalleryManager = new GalleryManager();
    ObjectManagers.getInstance().UserManager = new UserManager();
    ObjectManagers.getInstance().SearchManager = new SearchManager();
    ObjectManagers.getInstance().SharingManager = new SharingManager();
    ObjectManagers.getInstance().IndexingManager = new IndexingManager();
    ObjectManagers.getInstance().PersonManager = new PersonManager();
    ObjectManagers.getInstance().VersionManager = new VersionManager();
    ObjectManagers.getInstance().LocationManager = new LocationManager();
    this.InitCommonManagers();
  }

  public static async InitSQLManagers(): Promise<void> {
    await ObjectManagers.reset();
    await SQLConnection.init();
    const GalleryManager = require('./database/sql/GalleryManager').GalleryManager;
    const UserManager = require('./database/sql/UserManager').UserManager;
    const SearchManager = require('./database/sql/SearchManager').SearchManager;
    const SharingManager = require('./database/sql/SharingManager').SharingManager;
    const IndexingManager = require('./database/sql/IndexingManager').IndexingManager;
    const PersonManager = require('./database/sql/PersonManager').PersonManager;
    const VersionManager = require('./database/sql/VersionManager').VersionManager;
    ObjectManagers.getInstance().GalleryManager = new GalleryManager();
    ObjectManagers.getInstance().UserManager = new UserManager();
    ObjectManagers.getInstance().SearchManager = new SearchManager();
    ObjectManagers.getInstance().SharingManager = new SharingManager();
    ObjectManagers.getInstance().IndexingManager = new IndexingManager();
    ObjectManagers.getInstance().PersonManager = new PersonManager();
    ObjectManagers.getInstance().VersionManager = new VersionManager();
    ObjectManagers.getInstance().LocationManager = new LocationManager();
    this.InitCommonManagers();
    Logger.debug(LOG_TAG, 'SQL DB inited');
  }

}
