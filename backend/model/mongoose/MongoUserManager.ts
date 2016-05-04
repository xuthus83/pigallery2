import {User, UserRoles} from "../../../common/entities/User";
import {IUserManager} from "../IUserManager";
import {UserModel} from "./entities/UserModel";

export class MongoUserManager implements IUserManager {


    constructor() {
    }

    public findOne(filter, cb:(error:any, result:User) => void) {
        return UserModel.findOne(filter, function (err, result) {
            return cb(err, result);
        });
    }

    public find(filter, cb:(error:any, result:Array<User>) => void) {
        UserModel.find(filter, function (err, result) {
            return cb(err, result);
        });
    }

    public createUser(user, cb:(error:any, result:User) => void) {
        UserModel.create(user, cb);
    }

    public deleteUser(id:number, cb:(error:any) => void) {
        UserModel.remove({id: id}, cb);
    }
 

    public changeRole(id:number, newRole:UserRoles, cb:(error:any, result:string) => void) {
        return UserModel.update({id: id}, {role: newRole}, function (err) {
            if (!err) {
                return cb(err, "ok")
            }
            return cb(err, null);

        });
    }

    public changePassword(request:any, cb:(error:any, result:string) => void) {
        throw new Error("not implemented"); //TODO: implement
    }

}