import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {JobProgressDTO, JobProgressStates} from '../../../../common/entities/job/JobProgressDTO';
import {NetworkService} from '../../model/network/network.service';
import {JobScheduleDTO} from '../../../../common/entities/job/JobScheduleDTO';
import {JobDTO} from '../../../../common/entities/job/JobDTO';
import {BackendtextService} from '../../model/backendtext.service';
import {NotificationService} from '../../model/notification.service';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Injectable()
export class ScheduledJobsService {


  public progress: BehaviorSubject<{ [key: string]: JobProgressDTO }>;
  public onJobFinish: EventEmitter<string> = new EventEmitter<string>();
  timer: number = null;
  public jobStartingStopping: { [key: string]: boolean } = {};
  private subscribers = 0;

  constructor(private _networkService: NetworkService,
              private notification: NotificationService,
              private backendTextService: BackendtextService,
              private i18n: I18n) {
    this.progress = new BehaviorSubject({});
  }

  getProgress(schedule: JobScheduleDTO): JobProgressDTO {
    return this.progress.value[JobDTO.getHashName(schedule.jobName, schedule.config)];
  }

  subscribeToProgress(): void {
    this.incSubscribers();
  }

  unsubscribeFromProgress(): void {
    this.decSubscribers();
  }

  public async forceUpdate(): Promise<void> {
    return await this.loadProgress();
  }

  public async start(jobName: string, config?: any, soloStart: boolean = false): Promise<void> {
    this.jobStartingStopping[jobName] = true;
    await this._networkService.postJson('/admin/jobs/scheduled/' + jobName + '/' + (soloStart === true ? 'soloStart' : 'start'),
      {config: config});
    // placeholder to force showing running job
    this.addDummyProgress(jobName, config);
    delete this.jobStartingStopping[jobName];
    this.forceUpdate();
  }

  public async stop(jobName: string): Promise<void> {
    this.jobStartingStopping[jobName] = true;
    await this._networkService.postJson('/admin/jobs/scheduled/' + jobName + '/stop');
    delete this.jobStartingStopping[jobName];
    this.forceUpdate();
  }

  protected async loadProgress(): Promise<void> {
    const prevPrg = this.progress.value;
    this.progress.next(await this._networkService.getJson<{ [key: string]: JobProgressDTO }>('/admin/jobs/scheduled/progress'));
    for (const prg of Object.keys(prevPrg)) {
      if (!this.progress.value.hasOwnProperty(prg) ||
        // state changed from running to finished
        ((prevPrg[prg].state === JobProgressStates.running ||
            prevPrg[prg].state === JobProgressStates.cancelling) &&
          !(this.progress.value[prg].state === JobProgressStates.running ||
            this.progress.value[prg].state === JobProgressStates.cancelling)
        )) {
        this.onJobFinish.emit(prg);
        this.notification.info(this.i18n('Job finished') + ': ' + this.backendTextService.getJobName(prevPrg[prg].jobName));
      }
    }
  }

  protected getProgressPeriodically() {
    if (this.timer != null || this.subscribers === 0) {
      return;
    }
    let repeatTime = 5000;
    if (Object.values(this.progress.value).length === 0) {
      repeatTime = 10000;
    }
    this.timer = window.setTimeout(async () => {
      this.timer = null;
      this.getProgressPeriodically();
    }, repeatTime);
    this.loadProgress().catch(console.error);
  }

  private addDummyProgress(jobName: string, config: any) {
    const prgs = this.progress.value;
    prgs[JobDTO.getHashName(jobName, config)] = {
      jobName: jobName,
      state: JobProgressStates.running,
      HashName: JobDTO.getHashName(jobName, config),
      logs: [], steps: {
        skipped: 0,
        processed: 0,
        all: 0
      },
      time: {
        start: Date.now(),
        end: Date.now()
      }
    };
    this.progress.next(prgs);
  }

  private incSubscribers() {
    this.subscribers++;
    this.getProgressPeriodically();
  }

  private decSubscribers() {
    this.subscribers--;
  }

}
