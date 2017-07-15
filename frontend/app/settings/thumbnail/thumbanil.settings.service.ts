import {Injectable} from "@angular/core";
import {NetworkService} from "../../model/network/network.service";
import {ClientConfig} from "../../../../common/config/public/ConfigClass";
import {IPrivateConfig, ThumbnailConfig} from "../../../../common/config/private/IPrivateConfig";
import {ISettingsService} from "../_abstract/abstract.settings.service";

@Injectable()
export class ThumbnailSettingsService implements ISettingsService<{ server: ThumbnailConfig, client: ClientConfig.ThumbnailConfig }> {
  constructor(private _networkService: NetworkService) {
  }

  public async  getSettings(): Promise<{ server: ThumbnailConfig, client: ClientConfig.ThumbnailConfig }> {
    const settings = (await <Promise<IPrivateConfig>>this._networkService.getJson("/settings"));
    return {server: settings.Server.thumbnail, client: settings.Client.Thumbnail};
  }

  public updateSettings(settings: { server: ThumbnailConfig, client: ClientConfig.ThumbnailConfig }): Promise<void> {
    return this._networkService.putJson("/settings/thumbnail", {settings: settings});
  }

}
