import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {JobProgressDTO} from '../../../../common/entities/job/JobProgressDTO';
import {NetworkService} from '../../model/network/network.service';
import {JobScheduleDTO} from '../../../../common/entities/job/JobScheduleDTO';
import {JobDTO} from '../../../../common/entities/job/JobDTO';

@Injectable()
export class ScheduledJobsService {


  public progress: BehaviorSubject<{ [key: string]: JobProgressDTO }>;
  public onJobFinish: EventEmitter<string> = new EventEmitter<string>();
  timer: number = null;
  public jobStartingStopping: { [key: string]: boolean } = {};
  private subscribers = 0;

  constructor(private _networkService: NetworkService) {
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
    for (const prg in prevPrg) {
      if (!this.progress.value.hasOwnProperty(prg)) {
        this.onJobFinish.emit(prg);
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

  private incSubscribers() {
    this.subscribers++;
    this.getProgressPeriodically();
  }

  private decSubscribers() {
    this.subscribers--;
  }

}
