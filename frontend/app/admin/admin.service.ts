///<reference path="../../browser.d.ts"/>

import {Injectable} from '@angular/core'; 
import {NetworkService} from "../model/network/network.service.ts";
import {Http} from "@angular/http";
import {Message} from "../../../common/entities/Message"; 
import {User} from "../../../common/entities/User"; 

@Injectable()
export class AdminService {


    constructor(private _networkService:NetworkService){
    }

    public createUser(user:User): Promise<Message<string>>{
        return this._networkService.putJson("/user",{newUser:user});
    }


    public getUsers():Promise<Message<Array<User>>>{
        return this._networkService.getJson("/user/list");
    }


    public deleteUser(user:User) {
        return this._networkService.deleteJson("/user/"+user.id);
    }

    public updateRole(user:User) {
        return this._networkService.postJson("/user/"+user.id+"/role",{newRole:user.role});
    }
}
