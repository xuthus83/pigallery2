///<reference path="../../../browser.d.ts"/>

import {Injectable} from '@angular/core';
import {LoginCredential} from "../../../../common/entities/LoginCredential"; 
import {Http} from "@angular/http";
import {NetworkService} from "./network.service.ts";
import {User} from "../../../../common/entities/User";
import {Message} from "../../../../common/entities/Message";

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
