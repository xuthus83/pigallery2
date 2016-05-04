///<reference path="../../browser.d.ts"/>

import {Injectable} from '@angular/core'; 
import {NetworkService} from "../model/network/network.service.ts";
import {Http} from "@angular/http";
import {Message} from "../../../common/entities/Message"; 
import {User} from "../../../common/entities/User"; 

@Injectable()
export class AdminService  extends NetworkService{
 

    constructor(_http:Http){
        super(_http);
    }

    public createUser(user:User): Promise<Message<string>>{
        return this.putJson("/user",{newUser:user});
    }


    public getUsers():Promise<Message<Array<User>>>{
        return this.getJson("/user/list");
    }


    public deleteUser(user:User) {
        return this.deleteJson("/user/"+user.id);        
    }

    public updateRole(user:User) {
        return this.postJson("/user/"+user.id+"/role",{newRole:user.role});
    }
}
