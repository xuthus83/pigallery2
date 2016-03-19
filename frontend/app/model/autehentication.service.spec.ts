///<reference path="../../browser.d.ts"/>

import {
    it,
    inject,
    injectAsync,
    beforeEachProviders,
    TestComponentBuilder
} from 'angular2/testing';

import {Component, provide} from 'angular2/core';
import {AuthenticationService} from "../../../frontend/app/model/authentication.service";
import {UserService} from "./user.service";



describe('LoginService', () => {
    beforeEachProviders(() => [
        provide(UserService, {
            useFactory: function() {
                return {login() {}};
            }
        }),

        AuthenticationService
    ]);


    it('should call User service login', inject([ AuthenticationService,UserService ], (authService, userService) => {
        spyOn(userService,"login");
        expect(userService.login).not.toHaveBeenCalled();
        authService.login();
        expect(userService.login).toHaveBeenCalled();
    }));


});
