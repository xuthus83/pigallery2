import {IUserManager} from "./interfaces/IUserManager";
import {IGalleryManager} from "./interfaces/IGalleryManager";
import {ISearchManager} from "./interfaces/ISearchManager";
import {MySQLConnection} from "./mysql/MySQLConnection";

export class ObjectManagerRepository {

    private _galleryManager: IGalleryManager;
    private _userManager: IUserManager;
    private _searchManager: ISearchManager;
    private static _instance: ObjectManagerRepository = null;


    public static InitMemoryManagers() {
        const GalleryManager = require("./memory/GalleryManager").GalleryManager;
        const UserManager = require("./memory/UserManager").UserManager;
        const SearchManager = require("./memory/SearchManager").SearchManager;
        ObjectManagerRepository.getInstance().setGalleryManager(new GalleryManager());
        ObjectManagerRepository.getInstance().setUserManager(new UserManager());
        ObjectManagerRepository.getInstance().setSearchManager(new SearchManager());
    }

    public static InitMySQLManagers(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            MySQLConnection.init().then(() => {
                const GalleryManager = require("./mysql/GalleryManager").GalleryManager;
                const UserManager = require("./mysql/UserManager").UserManager;
                const SearchManager = require("./memory/SearchManager").SearchManager;
                ObjectManagerRepository.getInstance().setGalleryManager(new GalleryManager());
                ObjectManagerRepository.getInstance().setUserManager(new UserManager());
                ObjectManagerRepository.getInstance().setSearchManager(new SearchManager());
                resolve(true);
            }).catch(err => reject(err));
        });
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


    getGalleryManager(): IGalleryManager {
        return this._galleryManager;
    }

    setGalleryManager(value: IGalleryManager) {
        this._galleryManager = value;
    }

    getUserManager(): IUserManager {
        return this._userManager;
    }

    setUserManager(value: IUserManager) {
        this._userManager = value;
    }

    getSearchManager(): ISearchManager {
        return this._searchManager;
    }

    setSearchManager(value: ISearchManager) {
        this._searchManager = value;
    }

}