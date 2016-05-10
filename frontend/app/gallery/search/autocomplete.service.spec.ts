import {it, inject, beforeEachProviders} from "@angular/core/testing";
import {BaseRequestOptions, Http} from "@angular/http";
import {MockBackend} from "@angular/http/testing";
import {provide} from "@angular/core";
import "rxjs/Rx";
import {AutoCompleteService} from "./autocomplete.service";
import {NetworkService} from "../../model/network/network.service";


describe('AutoCompleteService', () => {


    beforeEachProviders(() => [
        MockBackend,
        BaseRequestOptions,
        provide(Http, {
            useFactory: (backend, options) => {
                return new Http(backend, options);
            }, deps: [MockBackend, BaseRequestOptions]
        }),
        NetworkService,
        AutoCompleteService
    ]);


    it('placeholder test', inject([], () => {
        expect(true).toBe(true);
    }));

});
