import {Injectable} from "@angular/core";
import {NetworkService} from "../../model/network/network.service";
import {IPrivateConfig} from "../../../../common/config/private/IPrivateConfig";
import {ClientConfig} from "../../../../common/config/public/ConfigClass";

@Injectable()
export class MapSettingsService {
  constructor(private _networkService: NetworkService) {
  }

  public async  getSettings(): Promise<ClientConfig.MapConfig> {
    return (await <Promise<IPrivateConfig>>this._networkService.getJson("/settings")).Client.Map;
  }

  public updateSettings(settings: ClientConfig.MapConfig): Promise<void> {
    return this._networkService.putJson("/settings/map", {settings: settings});
  }

}
