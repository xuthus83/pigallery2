///<reference path="../../../browser.d.ts"/>

import {Injectable} from '@angular/core';
import {User} from "../../../../common/entities/User";
import {Event} from "../../../../common/event/Event";
import {UserService} from "./user.service.ts";
import {LoginCredential} from "../../../../common/entities/LoginCredential";
import {Message} from "../../../../common/entities/Message";
import { Cookie } from 'ng2-cookies/ng2-cookies';
import {ErrorCodes} from "../../../../common/entities/Error";

declare module ServerInject{
   export var user;
}

@Injectable()
export class AuthenticationService{

    private _user:User = null;
    public OnAuthenticated:Event<User>;

    constructor(private _userService: UserService){
        this.OnAuthenticated = new Event();

        //picking up session..
        if(this.isAuthenticated() == false && Cookie.getCookie('pigallery2-session') != null){
            if(typeof ServerInject !== "undefined" && typeof ServerInject.user !== "undefined"){
                console.log("user found");
                this.setUser(ServerInject.user);
            }
            this.getSessionUser();   
        }
        
    }
    
    private getSessionUser(){
        this._userService.getSessionUser().then( (message:Message<User>) =>{ 
            if(message.error){
                console.log(message.error);
            }else{
                this._user = message.result;
                this.OnAuthenticated.trigger(this._user);
            }
        });
    }

    public login(credential:LoginCredential){
        this._userService.login(credential).then( (message:Message<User>) =>{
            if(message.error){
                console.log(ErrorCodes[message.error.code] + "message: "+ message.error.message);
            }else{
                this.setUser(message.result);
            }
        });
    }
    
    private setUser(user:User){
        this._user = user;
        this.OnAuthenticated.trigger(this._user);
    }

    public isAuthenticated():boolean{
        return (this._user && this._user != null) ? true : false;
    }
 
    public getUser(){
        return this._user;
    }


}
