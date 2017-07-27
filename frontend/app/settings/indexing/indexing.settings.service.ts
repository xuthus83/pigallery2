import {Injectable} from "@angular/core";
import {NetworkService} from "../../model/network/network.service";
import {SettingsService} from "../settings.service";
import {AbstractSettingsService} from "../_abstract/abstract.settings.service";
import {DatabaseType, IndexingConfig} from "../../../../common/config/private/IPrivateConfig";
import {IndexingProgressDTO} from "../../../../common/entities/settings/IndexingProgressDTO";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class IndexingSettingsService extends AbstractSettingsService<IndexingConfig> {


  public progress: BehaviorSubject<IndexingProgressDTO>;

  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
    this.progress = new BehaviorSubject(null);
  }

  public updateSettings(settings: IndexingConfig): Promise<void> {
    return this._networkService.putJson("/settings/indexing", {settings: settings});
  }


  public isSupported(): boolean {
    return this._settingsService.settings.value.Server.database.type != DatabaseType.memory;
  }

  public index() {
    return this._networkService.putJson("/admin/indexes/job");
  }

  public cancel() {
    return this._networkService.deleteJson("/admin/indexes/job");
  }

  public async getProgress() {
    this.progress.next(await this._networkService.getJson<IndexingProgressDTO>("/admin/indexes/job/progress"));
  }

  public reset() {
    return this._networkService.deleteJson("/admin/indexes");
  }


}
