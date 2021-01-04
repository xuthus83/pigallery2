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

export class ObjectManagers {

  private static _instance: ObjectManagers = null;

  private _galleryManager: IGalleryManager;
  private _userManager: IUserManager;
  private _searchManager: ISearchManager;
  private _sharingManager: ISharingManager;
  private _indexingManager: IIndexingManager;
  private _personManager: IPersonManager;
  private _versionManager: IVersionManager;
  private _jobManager: IJobManager;


  get VersionManager(): IVersionManager {
    return this._versionManager;
  }

  set VersionManager(value: IVersionManager) {
    this._versionManager = value;
  }

  get PersonManager(): IPersonManager {
    return this._personManager;
  }

  set PersonManager(value: IPersonManager) {
    this._personManager = value;
  }

  get IndexingManager(): IIndexingManager {
    return this._indexingManager;
  }

  set IndexingManager(value: IIndexingManager) {
    this._indexingManager = value;
  }


  get GalleryManager(): IGalleryManager {
    return this._galleryManager;
  }

  set GalleryManager(value: IGalleryManager) {
    this._galleryManager = value;
  }

  get UserManager(): IUserManager {
    return this._userManager;
  }

  set UserManager(value: IUserManager) {
    this._userManager = value;
  }

  get SearchManager(): ISearchManager {
    return this._searchManager;
  }

  set SearchManager(value: ISearchManager) {
    this._searchManager = value;
  }

  get SharingManager(): ISharingManager {
    return this._sharingManager;
  }

  set SharingManager(value: ISharingManager) {
    this._sharingManager = value;
  }

  get JobManager(): IJobManager {
    return this._jobManager;
  }

  set JobManager(value: IJobManager) {
    this._jobManager = value;
  }

  public static getInstance() {
    if (this._instance === null) {
      this._instance = new ObjectManagers();
    }
    return this._instance;
  }

  public static async reset() {
    if (ObjectManagers.getInstance().IndexingManager &&
      ObjectManagers.getInstance().IndexingManager.IsSavingInProgress) {
      await ObjectManagers.getInstance().IndexingManager.SavingReady;
    }
    if (ObjectManagers.getInstance().JobManager) {
      ObjectManagers.getInstance().JobManager.stopSchedules();
    }
    await SQLConnection.close();
    this._instance = null;
  }


  public static async InitCommonManagers() {
    const JobManager = require('./jobs/JobManager').JobManager;
    ObjectManagers.getInstance().JobManager = new JobManager();
  }

  public static async InitMemoryManagers() {
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
    this.InitCommonManagers();
  }

  public static async InitSQLManagers() {
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
    this.InitCommonManagers();
    Logger.debug('SQL DB inited');
  }

}
