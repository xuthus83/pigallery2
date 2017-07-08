import {Injectable} from "@angular/core";
import {NetworkService} from "../../model/network/network.service";
import {DataBaseConfig, IPrivateConfig} from "../../../../common/config/private/IPrivateConfig";

@Injectable()
export class DatabaseSettingsService {


  constructor(private _networkService: NetworkService) {
  }

  public async  getSettings(): Promise<DataBaseConfig> {
    return (await <Promise<IPrivateConfig>>this._networkService.getJson("/settings")).Server.database;
  }

  public updateSettings(settings): Promise<void> {
    return this._networkService.putJson("/settings/database", {databaseSettings: settings});
  }

  public testSettings(settings): Promise<void> {
    return this._networkService.postJson("/settings/test/database", {databaseSettings: settings});
  }
}
