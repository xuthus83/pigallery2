import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {BehaviorSubject} from 'rxjs';
import {StatisticDTO} from '../../../../../common/entities/settings/StatisticDTO';
import {ScheduledTasksService} from '../scheduled-tasks.service';
import {DefaultsTasks} from '../../../../../common/entities/task/TaskDTO';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';

@Injectable()
export class IndexingSettingsService extends AbstractSettingsService<ServerConfig.IndexingConfig> {


  public statistic: BehaviorSubject<StatisticDTO>;

  constructor(private _networkService: NetworkService,
              private _tasksService: ScheduledTasksService,
              _settingsService: SettingsService) {
    super(_settingsService);
    this.statistic = new BehaviorSubject(null);
    const sub = _settingsService.settings.subscribe(() => {
      if (this.isSupported()) {
        this.loadStatistic();
        sub.unsubscribe();
      }
    });
    this._tasksService.onTaskFinish.subscribe((taskName: string) => {
      if (taskName === DefaultsTasks[DefaultsTasks.Indexing] ||
        taskName === DefaultsTasks[DefaultsTasks['Database Reset']]) {
        if (this.isSupported()) {
          this.loadStatistic();
        }
      }
    });
  }

  public updateSettings(settings: ServerConfig.IndexingConfig): Promise<void> {
    return this._networkService.putJson('/settings/indexing', {settings: settings});
  }


  public isSupported(): boolean {
    return this._settingsService.settings.value.Server.Database.type !== ServerConfig.DatabaseType.memory;
  }


  async loadStatistic() {
    this.statistic.next(await this._networkService.getJson<StatisticDTO>('/admin/statistic'));
  }
}
