///<reference path="../../browser.d.ts"/>

import {Injectable} from 'angular2/core';
import {LoginCredential} from "../../../common/entities/LoginCredential"; 
import {Http} from "angular2/http";
import {NetworkService} from "./network.service";
import {User} from "../../../common/entities/User";
import {Message} from "../../../common/entities/Message";

@Injectable()
export class UserService extends NetworkService{

 

    constructor(_http:Http){ 
        super(_http);
    }


    public login(credential:LoginCredential): Promise<Message<User>>{
        return this.postJson("/user/login",{"loginCredential": credential});
    }

    public getSessionUser(): Promise<Message<User>>{
        return this.getJson("/user/login");
    }
  
}
