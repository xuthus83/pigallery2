import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TaskProgressDTO} from '../../../../common/entities/settings/TaskProgressDTO';
import {NetworkService} from '../../model/network/network.service';

@Injectable()
export class ScheduledTasksService {


    public progress: BehaviorSubject<{ [key: string]: TaskProgressDTO }>;
    public onTaskFinish: EventEmitter<string> = new EventEmitter<string>();
    timer: number = null;
    private subscribers = 0;

    constructor(private _networkService: NetworkService) {
        this.progress = new BehaviorSubject({});
    }

    public calcTimeElapsed(progress: TaskProgressDTO) {
        if (progress) {
            return (progress.time.current - progress.time.start);
        }
    }

    public calcTimeLeft(progress: TaskProgressDTO) {
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

    public forceUpdate() {
        return this.getProgress();
    }

    public async start(id: string, config?: any): Promise<void> {
        await this._networkService.postJson('/admin/tasks/scheduled/' + id + '/start', {config: config});
        this.forceUpdate();
    }

    public async stop(id: string): Promise<void> {
        await this._networkService.postJson('/admin/tasks/scheduled/' + id + '/stop');
        this.forceUpdate();
    }

    protected async getProgress() {
        const prevPrg = this.progress.value;
        this.progress.next(await this._networkService.getJson<{ [key: string]: TaskProgressDTO }>('/admin/tasks/scheduled/progress'));
        for (const prg in prevPrg) {
            if (!this.progress.value.hasOwnProperty(prg)) {
                this.onTaskFinish.emit(prg);
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
            await this.getProgress();
            this.timer = null;
            this.getProgressPeriodically();
        }, repeatTime);
    }

    private incSubscribers() {
        this.subscribers++;
        this.getProgressPeriodically();
    }

    private decSubscribers() {
        this.subscribers--;
    }

}
