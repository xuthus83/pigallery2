import {User} from "../../common/entities/User";
export interface IUserManager {
    findOne(filter,cb:(error: any,result:User) => void);
    find(filter,cb:(error: any,result:Array<User>) => void);
    createUser(user,cb:(error: any,result:User) => void);
    deleteUser(id:number,cb:(error: any,result:string) => void);
    changeRole(request:any,cb:(error: any) => void);
    changePassword(request:any,cb:(error: any,result:string) => void);
}