import {inject, TestBed} from '@angular/core/testing';
import {BaseRequestOptions, Http} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import 'rxjs/Rx';
import {NetworkService} from './network.service';
import {UserService} from './user.service';
import {LoginCredential} from '../../../../common/entities/LoginCredential';


describe('UserService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockBackend,
        BaseRequestOptions,
        {
          provide: Http, useFactory: (backend, options) => {
            return new Http(backend, options);
          }, deps: [MockBackend, BaseRequestOptions]
        },
        NetworkService,
        UserService]
    });


    it('should call postJson at login', inject([UserService, NetworkService], (userService, networkService) => {
      spyOn(networkService, 'postJson');
      let credential = new LoginCredential('name', 'pass');
      userService.login(credential);
      expect(networkService.postJson).toHaveBeenCalled();
      expect(networkService.postJson.calls.argsFor(0)).toEqual(['/user/login', {'loginCredential': credential}]);
    }));

    it('should call getJson at getSessionUser', inject([UserService, NetworkService], (userService, networkService) => {
      spyOn(networkService, 'getJson');
      userService.getSessionUser();
      expect(networkService.getJson).toHaveBeenCalled();
      expect(networkService.getJson.calls.argsFor(0)).toEqual(['/user/login']);
    }));


  });
});
