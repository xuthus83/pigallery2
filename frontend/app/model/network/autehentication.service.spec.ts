import {inject, TestBed} from "@angular/core/testing";
import {UserService} from "./user.service";
import {UserDTO} from "../../../../common/entities/UserDTO";
import "rxjs/Rx";
import {LoginCredential} from "../../../../common/entities/LoginCredential";
import {AuthenticationService} from "./authentication.service";

class MockUserService {
  public login(credential: LoginCredential): Promise<UserDTO> {
    return Promise.resolve(<UserDTO>{name: "testUserName"})
  }

  public async getSessionUser() {
    return null;
  }
}

describe('AuthenticationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: UserService, useClass: MockUserService},
        AuthenticationService]
    });
  });


  it('should call UserDTO service login', inject([AuthenticationService, UserService], (authService, userService) => {
    spyOn(userService, "login").and.callThrough();

    expect(userService.login).not.toHaveBeenCalled();
    authService.login();
    expect(userService.login).toHaveBeenCalled();
  }));

  it('should have NO Authenticated use', inject([AuthenticationService], (authService: AuthenticationService) => {
    expect(authService.user.value).toBe(null);
    expect(authService.isAuthenticated()).toBe(false);
  }));


  it('should have Authenticated use', inject([AuthenticationService], (authService: AuthenticationService) => {
    spyOn(authService.user, "next").and.callThrough();
    authService.user.subscribe((user) => {
      if (user == null) {
        return;
      }
      expect(authService.user.next).toHaveBeenCalled();
      expect(authService.user.value).not.toBe(null);
      expect(authService.isAuthenticated()).toBe(true);
    });
    authService.login(<any>{});

  }));


});
