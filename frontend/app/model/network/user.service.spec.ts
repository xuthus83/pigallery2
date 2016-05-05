///<reference path="../../../browser.d.ts"/>

import {it, inject, beforeEachProviders, beforeEach, afterEach} from "@angular/core/testing";
import {BaseRequestOptions, Http, Response, ResponseOptions} from "@angular/http";
import {MockBackend, MockConnection} from "@angular/http/testing";
import {provide} from "@angular/core";
import "rxjs/Rx";
import {NetworkService} from "./network.service";
import {Message} from "../../../../common/entities/Message";
import {UserService} from "./user.service";
import {LoginComponent} from "../../login/login.component";
import {LoginCredential} from "../../../../common/entities/LoginCredential";


describe('UserService', () => {


    beforeEachProviders(() => [
        MockBackend,
        BaseRequestOptions,
        provide(Http, {
            useFactory: (backend, options) => {
                return new Http(backend, options);
            }, deps: [MockBackend, BaseRequestOptions]
        }),
        NetworkService,
        UserService
    ]);





    it('should call postJson at login', inject([UserService,NetworkService], (userService,networkService) => {
        spyOn(networkService,"postJson");
        let credential = new LoginCredential("name","pass");
        userService.login(credential);
        expect(networkService.getJson).toHaveBeenCalled();
        expect(networkService.postJson.calls.argsFor(0)).toEqual(["/user/login",{"loginCredential": credential}]);
    }));
    
    it('should call getJson at getSessionUser', inject([UserService,NetworkService], (userService,networkService) => {
        spyOn(networkService,"getJson"); 
        userService.getSessionUser();
        expect(networkService.getJson).toHaveBeenCalled();
        expect(networkService.getJson.calls.argsFor(0)).toEqual(["/user/login"]);
    }));




});
