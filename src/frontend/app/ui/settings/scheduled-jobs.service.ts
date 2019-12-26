import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {JobProgressDTO} from '../../../../common/entities/job/JobProgressDTO';
import {NetworkService} from '../../model/network/network.service';
import {JobLastRunDTO} from '../../../../common/entities/job/JobLastRunDTO';

@Injectable()
export class ScheduledJobsService {


  public progress: BehaviorSubject<{ [key: string]: JobProgressDTO }>;
  public lastRuns: BehaviorSubject<{ [key: string]: { [key: string]: JobLastRunDTO } }>;
  public onJobFinish: EventEmitter<string> = new EventEmitter<string>();
  timer: number = null;
  private subscribers = 0;

  constructor(private _networkService: NetworkService) {
    this.progress = new BehaviorSubject({});
    this.lastRuns = new BehaviorSubject({});
  }

  public calcTimeElapsed(progress: JobProgressDTO) {
    if (progress) {
      return (progress.time.current - progress.time.start);
    }
  }

  public calcTimeLeft(progress: JobProgressDTO) {
    if (progress) {
      return (progress.time.current - progress.time.start) / progress.progress * progress.left;
    }
  }

  subscribeToProgress(): void {
    this.incSubscribers();
  }

  unsubscribeFromProgress(): void {
    this.decSubscribers();
  }

  public async forceUpdate(): Promise<void> {
    return await this.getProgress();
  }

  public async start(id: string, config?: any): Promise<void> {
    await this._networkService.postJson('/admin/jobs/scheduled/' + id + '/start', {config: config});
    this.forceUpdate();
  }

  public async stop(id: string): Promise<void> {
    await this._networkService.postJson('/admin/jobs/scheduled/' + id + '/stop');
    this.forceUpdate();
  }

  protected async getProgress(): Promise<void> {
    const prevPrg = this.progress.value;
    this.progress.next(await this._networkService.getJson<{ [key: string]: JobProgressDTO }>('/admin/jobs/scheduled/progress'));
    this.lastRuns.next(await this._networkService.getJson<{ [key: string]: { [key: string]: JobLastRunDTO } }>('/admin/jobs/scheduled/lastRun'));
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
    this.getProgress().catch(console.error);
  }

  private incSubscribers() {
    this.subscribers++;
    this.getProgressPeriodically();
  }

  private decSubscribers() {
    this.subscribers--;
  }

}
