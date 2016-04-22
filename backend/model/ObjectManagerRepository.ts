import {IUserManager} from "./IUserManager";
import {IGalleryManager} from "./IGalleryManager";
import {MongoGalleryManager} from "./mongoose/MongoGalleryManager";
import {MongoUserManager} from "./mongoose/MongoUserManager";
import {GalleryManager} from "./memory/GalleryManager";
import {UserManager} from "./memory/UserManager";

export class ObjectManagerRepository{
    
    private _galleryManager:IGalleryManager;
    private _userManager:IUserManager;
    private static _instance:ObjectManagerRepository = null;

    public static InitMongoManagers(){
        ObjectManagerRepository.getInstance().setGalleryManager(new MongoGalleryManager());
        ObjectManagerRepository.getInstance().setUserManager(new MongoUserManager());
    }

    public static MemoryMongoManagers(){
        ObjectManagerRepository.getInstance().setGalleryManager(new GalleryManager());
        ObjectManagerRepository.getInstance().setUserManager(new UserManager());
    }
    
    public static getInstance(){
        if(this._instance === null){
            this._instance = new ObjectManagerRepository();
        }
        return this._instance;
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
}