import {User} from "../../../common/entities/User";
import {IUserManager} from "../IUserManager";
export class UserManager implements IUserManager{

    private  users = [new User(1,"TestUser","test@test.hu","122345")];

    public findOne(filter,cb:(error: any,result:User) => void){
        return cb(null, this.users[0]);
    }

    public find(filter,cb:(error: any,result:Array<User>) => void){
        return cb(null, this.users);
    }

    public createUser(user,cb:(error: any,result:User) => void){

        this.users.push(user);
        return cb(null, user);
    }

    public deleteUser(id:number,cb:(error: any) => void){
        this.users = this.users.filter(u => u.id != id);
        return cb(null);
    }
    
    public changeRole(request:any,cb:(error: any,result:string) => void){
        throw new Error("not implemented"); //TODO: implement
    }
    public changePassword(request:any,cb:(error: any,result:string) => void){
        throw new Error("not implemented"); //TODO: implement
    }

}