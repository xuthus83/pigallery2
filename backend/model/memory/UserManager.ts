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
      this.createUser(<UserDTO>{name: "guest", password: "guest", role: UserRoles.LimitedGuest});
    }


  }


  public async findOne(filter: any) {
    const result = await this.find(filter);

    if (result.length == 0) {
      throw "UserDTO not found";
    }
    return result[0];
  }

  public async find(filter: any) {
    return this.db.get("users").filter((u: UserDTO) => Utils.equalsFilter(u, filter));
  }

  public async createUser(user: UserDTO) {
    user.id = parseInt(this.db.get("idCounter")) + 1;
    this.db.put("idCounter", user.id);
    let users = this.db.get("users");
    users.push(user);
    this.db.put("users", users);

    return user;
  }

  public deleteUser(id: number) {
    let deleted = this.db.get("users").filter((u: UserDTO) => u.id == id);
    let users = this.db.get("users").filter((u: UserDTO) => u.id != id);
    this.db.put("users", users);
    if (deleted.length > 0) {
      return deleted[0];
    }
    return null;
  }

  public async changeRole(id: number, newRole: UserRoles): Promise<UserDTO> {

    let users: Array<UserDTO> = this.db.get("users");

    for (let i = 0; i < users.length; i++) {
      if (users[i].id == id) {
        users[i].role = newRole;
        this.db.put("users", users);
        return users[i];
      }
    }
  }

  public async changePassword(request: any) {
    throw new Error("not implemented"); //TODO: implement
  }

}
