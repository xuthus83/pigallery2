///<reference path="flat-file-db.ts"/>
import {UserDTO, UserRoles} from "../../../common/entities/UserDTO";
import {IUserManager} from "../interfaces/IUserManager";
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
            this.createUser(<UserDTO>{name: "developer", password: "developer", role: UserRoles.Developer});
            this.createUser(<UserDTO>{name: "admin", password: "admin", role: UserRoles.Admin});
            this.createUser(<UserDTO>{name: "user", password: "user", role: UserRoles.User});
            this.createUser(<UserDTO>{name: "guest", password: "guest", role: UserRoles.Guest});
        }


    }


    public findOne(filter: any, cb: (error: any, result: UserDTO) => void) {
        this.find(filter, (error, result: Array<UserDTO>) => {
            if (error) {
                return cb(error, null);
            }
            if (result.length == 0) {
                return cb("UserDTO not found", null);
            }
            return cb(null, result[0]);

        });
    }

    public find(filter: any, cb: (error: any, result: Array<UserDTO>) => void) {

        let users = this.db.get("users").filter((u: UserDTO) => Utils.equalsFilter(u, filter));

        return cb(null, users);
    }

    public createUser(user: UserDTO, cb: (error: any, result: UserDTO) => void = (e, r) => {
    }) {
        user.id = parseInt(this.db.get("idCounter")) + 1;
        this.db.put("idCounter", user.id);
        let users = this.db.get("users");
        users.push(user);

        this.db.put("users", users);
        return cb(null, user);
    }

    public deleteUser(id: number, cb: (error: any) => void) {
        let users = this.db.get("users").filter((u: UserDTO) => u.id != id);
        this.db.put("users", users);
        return cb(null);
    }

    public changeRole(id: number, newRole: UserRoles, cb: (error: any, result: string) => void) {

        let users: Array<UserDTO> = this.db.get("users");

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