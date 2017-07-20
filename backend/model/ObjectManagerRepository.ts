import {IUserManager} from "./interfaces/IUserManager";
import {IGalleryManager} from "./interfaces/IGalleryManager";
import {ISearchManager} from "./interfaces/ISearchManager";
import {SQLConnection} from "./sql/SQLConnection";
import {ISharingManager} from "./interfaces/ISharingManager";
import {Logger} from "../Logger";

export class ObjectManagerRepository {

  private _galleryManager: IGalleryManager;
  private _userManager: IUserManager;
  private _searchManager: ISearchManager;
  private _sharingManager: ISharingManager;
  private static _instance: ObjectManagerRepository = null;


  public static async InitMemoryManagers() {
    await ObjectManagerRepository.reset();
    const GalleryManager = require("./memory/GalleryManager").GalleryManager;
    const UserManager = require("./memory/UserManager").UserManager;
    const SearchManager = require("./memory/SearchManager").SearchManager;
    const SharingManager = require("./memory/SharingManager").SharingManager;
    ObjectManagerRepository.getInstance().GalleryManager = new GalleryManager();
    ObjectManagerRepository.getInstance().UserManager = new UserManager();
    ObjectManagerRepository.getInstance().SearchManager = new SearchManager();
    ObjectManagerRepository.getInstance().SharingManager = new SharingManager();
  }

  public static async InitSQLManagers() {
    await ObjectManagerRepository.reset();
    await SQLConnection.init();
    const GalleryManager = require("./sql/GalleryManager").GalleryManager;
    const UserManager = require("./sql/UserManager").UserManager;
    const SearchManager = require("./sql/SearchManager").SearchManager;
    const SharingManager = require("./sql/SharingManager").SharingManager;
    ObjectManagerRepository.getInstance().GalleryManager = new GalleryManager();
    ObjectManagerRepository.getInstance().UserManager = new UserManager();
    ObjectManagerRepository.getInstance().SearchManager = new SearchManager();
    ObjectManagerRepository.getInstance().SharingManager = new SharingManager();
    Logger.debug("SQL DB inited");
  }

  public static getInstance() {
    if (this._instance === null) {
      this._instance = new ObjectManagerRepository();
    }
    return this._instance;
  }

  public static async reset() {
    await SQLConnection.close();
    this._instance = null;
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

}
