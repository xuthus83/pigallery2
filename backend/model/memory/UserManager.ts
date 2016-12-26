///<reference path="flat-file-db.ts"/>
import {User, UserRoles} from "../../../common/entities/User";
import {IUserManager} from "../IUserManager";
import {ProjectPath} from "../../ProjectPath";
import {Utils} from "../../../common/Utils";
import * as flatfile from "flat-file-db";
import * as path from "path";


export class UserManager implements IUserManager {
    private db: any = null;

    generateId(): string {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + s4() + s4();
    }

    constructor() {
        this.db = flatfile.sync(path.join(ProjectPath.Root, 'users.db'));

        if (!this.db.has("idCounter")) {
            console.log("creating counter");
            this.db.put("idCounter", 1);
        }

        if (!this.db.has("users")) {
            this.db.put("users", []);
            //TODO: remove defaults
            this.createUser(new User("developer", "developer", UserRoles.Developer));
            this.createUser(new User("admin", "admin", UserRoles.Admin));
            this.createUser(new User("user", "user", UserRoles.User));
            this.createUser(new User("guest", "guest", UserRoles.Guest));
        }


    }


    public findOne(filter: any, cb: (error: any, result: User) => void) {
        this.find(filter, (error, result: Array<User>) => {
            if (error) {
                return cb(error, null);
            }
            if (result.length == 0) {
                return cb("User not found", null);
            }
            return cb(null, result[0]);

        });
    }

    public find(filter: any, cb: (error: any, result: Array<User>) => void) {

        let users = this.db.get("users").filter((u: User) => Utils.equalsFilter(u, filter));

        return cb(null, users);
    }

    public createUser(user: User, cb: (error: any, result: User) => void = (e, r) => {
    }) {
        user.id = parseInt(this.db.get("idCounter")) + 1;
        this.db.put("idCounter", user.id);
        let users = this.db.get("users");
        users.push(user);

        this.db.put("users", users);
        return cb(null, user);
    }

    public deleteUser(id: number, cb: (error: any) => void) {
        let users = this.db.get("users").filter((u: User) => u.id != id);
        this.db.put("users", users);
        return cb(null);
    }

    public changeRole(id: number, newRole: UserRoles, cb: (error: any, result: string) => void) {

        let users: Array<User> = this.db.get("users");

        for (let i = 0; i < users.length; i++) {
            if (users[i].id == id) {
                users[i].role = newRole;
                break;
            }
        }
        this.db.put("users", users);
    }

    public changePassword(request: any, cb: (error: any, result: string) => void) {
        throw new Error("not implemented"); //TODO: implement
    }

}