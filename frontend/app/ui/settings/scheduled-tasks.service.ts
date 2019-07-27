import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TaskProgressDTO} from '../../../../common/entities/settings/TaskProgressDTO';
import {NetworkService} from '../../model/network/network.service';

@Injectable()
export class ScheduledTasksService {


  public progress: BehaviorSubject<{ [key: string]: TaskProgressDTO }>;
  timer: number = null;
  private subscribers = 0;

  constructor(private _networkService: NetworkService) {
    this.progress = new BehaviorSubject({});
  }


  subscribeToProgress(): void {
    this.incSubscribers();
  }

  unsubscribeFromProgress(): void {
    this.decSubscribers();
  }

  public forceUpdate() {
    return this.getProgress();
  }

  public async start(id: string, config?: any) {
    return await this._networkService.postJson('/admin/tasks/scheduled/' + id + '/start', {config: config});
  }

  public async stop(id: string) {
    return await this._networkService.postJson('/admin/tasks/scheduled/' + id + '/stop');
  }

  protected async getProgress() {
    return this.progress.next(await this._networkService.getJson<{ [key: string]: TaskProgressDTO }>('/admin/tasks/scheduled/progress'));
  }

  protected getProgressPeriodically() {
    if (this.timer != null || this.subscribers === 0) {
      return;
    }
    this.timer = window.setTimeout(async () => {
      await this.getProgress();
      this.timer = null;
      this.getProgressPeriodically();
    }, 5000);
  }

  private incSubscribers() {
    this.subscribers++;
    this.getProgressPeriodically();
  }

  private decSubscribers() {
    this.subscribers--;
  }

}
