///<reference path="../../../browser.d.ts"/>

import {Injectable} from "@angular/core";
import {User} from "../../../../common/entities/User";
import {NetworkService} from "../../model/network/network.service";
import {Message} from "../../../../common/entities/Message";

@Injectable()
export class UserManagerSettingsService {


    constructor(private _networkService:NetworkService) {
    }

    public createUser(user:User):Promise<Message<string>> {
        return this._networkService.putJson("/user", {newUser: user});
    }


    public getUsers():Promise<Message<Array<User>>> {
        return this._networkService.getJson("/user/list");
    }


    public deleteUser(user:User) {
        return this._networkService.deleteJson("/user/" + user.id);
    }

    public updateRole(user:User) {
        return this._networkService.postJson("/user/" + user.id + "/role", {newRole: user.role});
    }
}
