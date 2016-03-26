///<reference path="../../browser.d.ts"/>

import {Injectable} from 'angular2/core';
import {User} from "../../../common/entities/User";
import {Event} from "../../../common/event/Event";
import {UserService} from "./user.service";
import {LoginCredential} from "../../../common/entities/LoginCredential";
import {Message} from "../../../common/entities/Message";
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable()
export class AuthenticationService{

    private _user:User = null;
    public OnAuthenticated:Event<User>;

    constructor(private _userService: UserService){
        this.OnAuthenticated = new Event();

        //picking up session..
        if(this.isAuthenticated() == false && Cookie.getCookie('pigallery2-session') != null){
            this.getSessionUser();   
        }
        
    }
    
    private getSessionUser(){
        this._userService.getSessionUser().then( (message:Message<User>) =>{
            console.log(message);
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
            console.log(message);
            if(message.error){
                console.log(message.error);
            }else{
                this._user = message.result;
                this.OnAuthenticated.trigger(this._user);
            }
        });
    }

    public isAuthenticated():boolean{
        return (this._user && this._user != null) ? true : false;
    }
 


}
