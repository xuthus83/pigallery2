///<reference path="../../typings/index.d.ts"/>

import {IUserManager} from "./IUserManager";
import {IGalleryManager} from "./IGalleryManager";
import {ISearchManager} from "./ISearchManager";

export class ObjectManagerRepository {

    private _galleryManager:IGalleryManager;
    private _userManager:IUserManager;
    private _searchManager:ISearchManager;
    private static _instance:ObjectManagerRepository = null;

    public static InitMongoManagers() {
        let MongoGalleryManager = require("./mongoose/MongoGalleryManager");
        let MongoUserManager = require("./mongoose/MongoUserManager");
        let MongoSearchManager = require("./mongoose/MongoSearchManager");
        ObjectManagerRepository.getInstance().setGalleryManager(new MongoGalleryManager());
        ObjectManagerRepository.getInstance().setUserManager(new MongoUserManager());
        ObjectManagerRepository.getInstance().setSearchManager(new MongoSearchManager());
    }

    public static MemoryMongoManagers() {
        let GalleryManager = require("./memory/GalleryManager");
        let UserManager = require("./memory/UserManager");
        let SearchManager = require("./memory/SearchManager");
        ObjectManagerRepository.getInstance().setGalleryManager(new GalleryManager());
        ObjectManagerRepository.getInstance().setUserManager(new UserManager());
        ObjectManagerRepository.getInstance().setSearchManager(new SearchManager());
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


    getGalleryManager():IGalleryManager {
        return this._galleryManager;
    }

    setGalleryManager(value:IGalleryManager) {
        this._galleryManager = value;
    }

    getUserManager():IUserManager {
        return this._userManager;
    }

    setUserManager(value:IUserManager) {
        this._userManager = value;
    }

    getSearchManager():ISearchManager {
        return this._searchManager;
    }

    setSearchManager(value:ISearchManager) {
        this._searchManager = value;
    }

}