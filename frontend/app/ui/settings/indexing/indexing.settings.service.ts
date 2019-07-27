import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {DatabaseType, IndexingConfig} from '../../../../../common/config/private/IPrivateConfig';
import {TaskProgressDTO} from '../../../../../common/entities/settings/TaskProgressDTO';
import {BehaviorSubject} from 'rxjs';
import {IndexingDTO} from '../../../../../common/entities/settings/IndexingDTO';
import {StatisticDTO} from '../../../../../common/entities/settings/StatisticDTO';

@Injectable()
export class IndexingSettingsService extends AbstractSettingsService<IndexingConfig> {



  constructor(private _networkService: NetworkService,
              _settingsService: SettingsService) {
    super(_settingsService);
  }

  public updateSettings(settings: IndexingConfig): Promise<void> {
    return this._networkService.putJson('/settings/indexing', {settings: settings});
  }


  public isSupported(): boolean {
    return this._settingsService.settings.value.Server.database.type !== DatabaseType.memory;
  }


  getStatistic() {
    return this._networkService.getJson<StatisticDTO>('/admin/statistic');
  }
}
