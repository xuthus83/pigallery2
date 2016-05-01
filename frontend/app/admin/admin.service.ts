///<reference path="../../browser.d.ts"/>

import {Injectable} from 'angular2/core'; 
import {NetworkService} from "../model/network/network.service.ts";
import {Http} from "angular2/http";
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


 


}