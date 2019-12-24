import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {BehaviorSubject} from 'rxjs';
import {StatisticDTO} from '../../../../../common/entities/settings/StatisticDTO';
import {ScheduledJobsService} from '../scheduled-jobs.service';
import {DefaultsJobs} from '../../../../../common/entities/job/JobDTO';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';
import {first} from 'rxjs/operators';

@Injectable()
export class IndexingSettingsService extends AbstractSettingsService<ServerConfig.IndexingConfig> {


  public statistic: BehaviorSubject<StatisticDTO>;

  constructor(private _networkService: NetworkService,
              private _jobsService: ScheduledJobsService,
              _settingsService: SettingsService) {
    super(_settingsService);
    this.statistic = new BehaviorSubject(null);
    _settingsService.settings.pipe(first()).subscribe(() => {
      if (this.isSupported()) {
        this.loadStatistic();
      }
    });
    this._jobsService.onJobFinish.subscribe((jobName: string) => {
      if (jobName === DefaultsJobs[DefaultsJobs.Indexing] ||
        jobName === DefaultsJobs[DefaultsJobs['Database Reset']]) {
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
