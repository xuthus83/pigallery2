///<reference path="../../browser.d.ts"/>

import {Injectable} from 'angular2/core';
import {LoginCredential} from "../../../common/entities/LoginCredential"; 
import {Http} from "angular2/http";
import {NetworkService} from "./network.service";

@Injectable()
export class UserService extends NetworkService{

 

    constructor(_http:Http){ 
        super(_http);
    }


    public login(credential:LoginCredential){
        return this.postJson("/user/login",credential);
    }

  
}
