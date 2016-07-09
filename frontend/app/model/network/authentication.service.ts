///<reference path="../../../browser.d.ts"/>

import {Injectable} from "@angular/core";
import {User, UserRoles} from "../../../../common/entities/User";
import {Event} from "../../../../common/event/Event";
import {UserService} from "./user.service.ts";
import {LoginCredential} from "../../../../common/entities/LoginCredential";
import {Message} from "../../../../common/entities/Message";
import {Cookie} from "ng2-cookies/ng2-cookies";
import {ErrorCodes} from "../../../../common/entities/Error";
import {Config} from "../../config/Config";

declare module ServerInject {
    export var user;
}

@Injectable()
export class AuthenticationService {

    private _user:User = null;
    public OnUserChanged:Event<User>;

    constructor(private _userService:UserService) {
        this.OnUserChanged = new Event();

        //picking up session..
        if (this.isAuthenticated() == false && Cookie.get('pigallery2-session') != null) {
            if (typeof ServerInject !== "undefined" && typeof ServerInject.user !== "undefined") {
                this.setUser(ServerInject.user);
            }
            this.getSessionUser();
        }

    }

    private getSessionUser() {
        this._userService.getSessionUser().then((message:Message<User>) => {
            if (message.error) {
                console.log(message.error);
            } else {
                this._user = message.result;
                this.OnUserChanged.trigger(this._user);
            }
        });
    }

    private setUser(user:User) {
        this._user = user;
        this.OnUserChanged.trigger(this._user);
    }

    public login(credential:LoginCredential) {
        return this._userService.login(credential).then((message:Message<User>) => {
            if (message.error) {
                console.log(ErrorCodes[message.error.code] + ", message: " + message.error.message);
            } else {
                this.setUser(message.result);
            }
            return message;
        });
    }


    public isAuthenticated():boolean {
        if (Config.Client.authenticationRequired === false) {
            return true;
        }
        return (this._user && this._user != null) ? true : false;
    }

    public getUser() {
        if (Config.Client.authenticationRequired === false) {
            return new User("", "", UserRoles.Admin);
        }
        return this._user;
    }

    public logout() {
        this._userService.logout();
        this.setUser(null);
    }


}
