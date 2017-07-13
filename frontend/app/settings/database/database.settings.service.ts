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

  public updateSettings(settings: DataBaseConfig): Promise<void> {
    return this._networkService.putJson("/settings/database", {settings: settings});
  }

  public testSettings(settings: DataBaseConfig): Promise<void> {
    return this._networkService.postJson<void>("/settings/test/database", {settings: settings});
  }
}
