import {IUserManager} from "./interfaces/IUserManager";
import {IGalleryManager} from "./interfaces/IGalleryManager";
import {ISearchManager} from "./interfaces/ISearchManager";
import {MySQLConnection} from "./mysql/MySQLConnection";
import {ISharingManager} from "./interfaces/ISharingManager";
import {Logger} from "../Logger";

export class ObjectManagerRepository {

  private _galleryManager: IGalleryManager;
  private _userManager: IUserManager;
  private _searchManager: ISearchManager;
  private _sharingManager: ISharingManager;
  private static _instance: ObjectManagerRepository = null;


  public static InitMemoryManagers() {
    const GalleryManager = require("./memory/GalleryManager").GalleryManager;
    const UserManager = require("./memory/UserManager").UserManager;
    const SearchManager = require("./memory/SearchManager").SearchManager;
    const SharingManager = require("./memory/SharingManager").SharingManager;
    ObjectManagerRepository.getInstance().GalleryManager = new GalleryManager();
    ObjectManagerRepository.getInstance().UserManager = new UserManager();
    ObjectManagerRepository.getInstance().SearchManager = new SearchManager();
    ObjectManagerRepository.getInstance().SharingManager = new SharingManager();
  }

  public static async InitMySQLManagers() {
    await MySQLConnection.init();
    const GalleryManager = require("./mysql/GalleryManager").GalleryManager;
    const UserManager = require("./mysql/UserManager").UserManager;
    const SearchManager = require("./mysql/SearchManager").SearchManager;
    const SharingManager = require("./mysql/SharingManager").SharingManager;
    ObjectManagerRepository.getInstance().GalleryManager = new GalleryManager();
    ObjectManagerRepository.getInstance().UserManager = new UserManager();
    ObjectManagerRepository.getInstance().SearchManager = new SearchManager();
    ObjectManagerRepository.getInstance().SharingManager = new SharingManager();
    Logger.debug("MySQL DB inited");
  }

  public static getInstance() {
    if (this._instance === null) {
      this._instance = new ObjectManagerRepository();
    }
    return this._instance;
  }

  public static reset() {
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
