import {Injectable} from "@angular/core";
import {NetworkService} from "../../model/network/network.service";
import {MapConfig} from "../../../../common/config/public/ConfigClass";
import {IPrivateConfig} from "../../../../common/config/private/IPrivateConfig";

@Injectable()
export class MapSettingsService {
  constructor(private _networkService: NetworkService) {
  }

  public async  getSettings(): Promise<MapConfig> {
    return (await <Promise<IPrivateConfig>>this._networkService.getJson("/settings")).Client.Map;
  }

  public updateSettings(settings: MapConfig): Promise<void> {
    return this._networkService.putJson("/settings/map", {settings: settings});
  }

  public testSettings(settings: MapConfig): Promise<void> {
    return this._networkService.postJson<void>("/settings/test/map", {settings: settings});
  }
}
