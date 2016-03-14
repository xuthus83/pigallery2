///<reference path="../../browser.d.ts"/>

import {
    it,
    inject,
    injectAsync,
    beforeEachProviders,
    TestComponentBuilder
} from 'angular2/testing';

import {Component, provide} from 'angular2/core';
import {BaseRequestOptions, Http} from 'angular2/http';
import {MockBackend} from 'angular2/http/testing';
import {LoginService} from "./login.service";
import {NetworkService} from "../model/network.service";



describe('LoginService', () => {
    beforeEachProviders(() => [
        provide(NetworkService, {
            useFactory: function() {
                return {login() {}};
            }
        }),

        LoginService
    ]);


    it('should call Network service login', inject([ LoginService,NetworkService ], (loginService, networkService) => {
        spyOn(networkService,"login");
        expect(networkService.login).not.toHaveBeenCalled();
        loginService.login();
        expect(networkService.login).toHaveBeenCalled();
    }));

    it('should be true', () => {
        expect(true).toEqual(true)
    });

});
