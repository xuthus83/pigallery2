import {Injectable} from "@angular/core";
import {NetworkService} from "../../model/network/network.service";
import {DataBaseConfig, IPrivateConfig} from "../../../../common/config/private/IPrivateConfig";
import {NavigationService} from "../../model/navigation.service";
import {UserRoles} from "../../../../common/entities/UserDTO";
import {AuthenticationService} from "../../model/network/authentication.service";

@Injectable()
export class DatabaseSettingsService {


  constructor(private _networkService: NetworkService, private _authService: AuthenticationService, private _navigation: NavigationService) {

    if (!this._authService.isAuthenticated() ||
      this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
  }

  public async  getSettings(): Promise<DataBaseConfig> {
    return (await <Promise<IPrivateConfig>>this._networkService.getJson("/settings")).Server.database;
  }

  public updateSettings(settings): Promise<void> {
    return this._networkService.putJson("/settings/database", {databaseSettings: settings});
  }

  public testSettings(settings): Promise<void> {
    return this._networkService.postJson<void>("/settings/test/database", {databaseSettings: settings});
  }
}
