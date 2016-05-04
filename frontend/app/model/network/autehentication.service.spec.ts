///<reference path="../../../browser.d.ts"/>

import {
    it,
    inject,
    injectAsync,
    beforeEachProviders
} from '@angular/core/testing';
 

import {provide} from '@angular/core'; 
import {UserService} from "./user.service.ts";
import {User} from "../../../../common/entities/User";
import {Message} from "../../../../common/entities/Message";
import "rxjs/Rx";
import {LoginCredential} from "../../../../common/entities/LoginCredential";
import {AuthenticationService} from "./authentication.service";

class MockUserService {
    public login(credential:LoginCredential){
        return  Promise.resolve(new Message<User>(null,new User()))
    }
}

describe('AuthenticationService', () => {
    beforeEachProviders(() => [
        provide(UserService, {useClass: MockUserService}),
        AuthenticationService
    ]);


    it('should call User service login', inject([ AuthenticationService,UserService ], (authService, userService) => {
        spyOn(userService,"login").and.callThrough();
        
        expect(userService.login).not.toHaveBeenCalled();
        authService.login();
        expect(userService.login).toHaveBeenCalled();
    }));


});
