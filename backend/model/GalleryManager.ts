import {User} from "../../common/entities/User";
export class UserManager {

    private static  users = [new User(1,"TestUser","test@test.hu","122345")];

    public static findOne(filter,cb:(error: any,result:User) => void){
        return cb(null, UserManager.users[0]);
    }

    public static find(filter,cb:(error: any,result:Array<User>) => void){
        return cb(null, UserManager.users);
    }

    public static createUser(user,cb:(error: any,result:User) => void){
        UserManager.users.push(user);
        return cb(null, user);
    }

    public static deleteUser(id:number,cb:(error: any,result:string) => void){
        UserManager.users = UserManager.users.filter(u => u.id != id);
        return cb(null, "ok");
    }
    
    public static changeRole(request:any,cb:(error: any,result:string) => void){
        return cb(null,"ok");
    }
    public static changePassword(request:any,cb:(error: any,result:string) => void){
        return cb(null,"ok");
    }

}