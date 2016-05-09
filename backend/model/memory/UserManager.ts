import {User, UserRoles} from "../../../common/entities/User";
import {IUserManager} from "../IUserManager";
export class UserManager implements IUserManager {

    private users = [new User(1, "developer", "developer", UserRoles.Developer),
        new User(2, "admin", "admin", UserRoles.Admin),
        new User(3, "user", "user", UserRoles.User),
        new User(4, "guest", "guest", UserRoles.Guest)];

    public findOne(filter, cb:(error:any, result:User) => void) {
        return cb(null, this.users[1]);
    }

    public find(filter, cb:(error:any, result:Array<User>) => void) {
        return cb(null, this.users);
    }

    public createUser(user, cb:(error:any, result:User) => void) {

        this.users.push(user);
        return cb(null, user);
    }

    public deleteUser(id:number, cb:(error:any) => void) {
        this.users = this.users.filter(u => u.id != id);
        return cb(null);
    }

    public changeRole(id:number, newRole:UserRoles, cb:(error:any, result:string) => void) {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === id) {
                this.users[i].role = newRole;
                return cb(null, "ok");
            }
        }
    }

    public changePassword(request:any, cb:(error:any, result:string) => void) {
        throw new Error("not implemented"); //TODO: implement
    }

}