import {Injectable} from '@angular/core';
import {BehaviorSubject, first} from 'rxjs';
import {NetworkService} from '../../model/network/network.service';

import {WebConfig} from '../../../../common/config/private/WebConfig';
import {WebConfigClassBuilder} from 'typeconfig/src/decorators/builders/WebConfigClassBuilder';
import {ConfigPriority} from '../../../../common/config/public/ClientConfig';
import {CookieNames} from '../../../../common/CookieNames';
import {CookieService} from 'ngx-cookie-service';
import {DefaultsJobs, JobDTO} from '../../../../common/entities/job/JobDTO';
import {StatisticDTO} from '../../../../common/entities/settings/StatisticDTO';
import {ScheduledJobsService} from './scheduled-jobs.service';

@Injectable()
export class SettingsService {
  public configPriority = ConfigPriority.basic;
  public settings: BehaviorSubject<WebConfig>;
  private fetchingSettings = false;
  public availableJobs: BehaviorSubject<JobDTO[]>;
  public statistic: BehaviorSubject<StatisticDTO>;

  constructor(private networkService: NetworkService,
              private jobsService: ScheduledJobsService,
              private cookieService: CookieService) {
    this.statistic = new BehaviorSubject(null);
    this.availableJobs = new BehaviorSubject([]);
    this.settings = new BehaviorSubject<WebConfig>(new WebConfig());
    this.getSettings().catch(console.error);

    if (this.cookieService.check(CookieNames.configPriority)) {
      this.configPriority =
        parseInt(this.cookieService.get(CookieNames.configPriority));
    }


    this.settings.pipe(first()).subscribe(() => {
      this.loadStatistic();
    });
    this.jobsService.onJobFinish.subscribe((jobName: string) => {
      if (
        jobName === DefaultsJobs[DefaultsJobs.Indexing] ||
        jobName === DefaultsJobs[DefaultsJobs['Database Reset']]
      ) {
        this.loadStatistic();
      }
    });

  }

  public async getAvailableJobs(): Promise<void> {
    this.availableJobs.next(
      await this.networkService.getJson<JobDTO[]>('/admin/jobs/available')
    );
  }

  public async getSettings(): Promise<void> {
    if (this.fetchingSettings === true) {
      return;
    }
    this.fetchingSettings = true;
    try {
      const wcg = WebConfigClassBuilder.attachInterface(new WebConfig());
      wcg.load(
        await this.networkService.getJson<Promise<WebConfig>>('/settings')
      );
      this.settings.next(wcg);
    } catch (e) {
      console.error(e);
    }
    this.fetchingSettings = false;
  }

  configPriorityChanged(): void {
    // save it for some years
    this.cookieService.set(
      CookieNames.configPriority,
      this.configPriority.toString(),
      365 * 50
    );
  }

  async loadStatistic(): Promise<void> {
    this.statistic.next(
      await this.networkService.getJson<StatisticDTO>('/admin/statistic')
    );
  }
}
