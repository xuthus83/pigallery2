import {Component, EventEmitter, Input, Output} from '@angular/core';
import {JobProgressStates} from '../../../../../../common/entities/job/JobProgressDTO';
import {ErrorDTO} from '../../../../../../common/entities/Error';
import {ScheduledJobsService} from '../../scheduled-jobs.service';
import {NotificationService} from '../../../../model/notification.service';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {JobDTO} from '../../../../../../common/entities/job/JobDTO';
import {BackendtextService} from '../../../../model/backendtext.service';

@Component({
  selector: 'app-settings-job-button',
  templateUrl: './job-button.settings.component.html',
  styleUrls: ['./job-button.settings.component.css']
})
export class JobButtonComponent {
  @Input() jobName: string;
  @Input() config: any = {};
  @Input() shortName = false;
  @Input() disabled = false;
  @Input() soloRun = false;
  @Input() allowParallelRun = false;
  @Input() danger = false;
  JobProgressStates = JobProgressStates;
  @Output() error = new EventEmitter<string>();

  constructor(private notification: NotificationService,
              public jobsService: ScheduledJobsService,
              public backendTextService: BackendtextService,
              private i18n: I18n) {
  }

  public get Running() {
    return this.Progress && (this.Progress.state === JobProgressStates.running || this.Progress.state === JobProgressStates.cancelling);
  }

  get Progress() {
    return this.jobsService.progress.value[JobDTO.getHashName(this.jobName, this.config)];
  }


  public async start() {
    this.error.emit('');
    try {
      await this.jobsService.start(this.jobName, this.config, this.soloRun, this.allowParallelRun);
      this.notification.success(this.i18n('Job started') + ': ' + this.backendTextService.getJobName(this.jobName));
      return true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error.emit((<ErrorDTO>err).message);
      }
    }

    return false;
  }

  public async stop() {
    this.error.emit('');
    try {
      await this.jobsService.stop(this.jobName);
      this.notification.info(this.i18n('Stopping job') + ': ' + this.backendTextService.getJobName(this.jobName));
      return true;
    } catch (err) {
      console.error(err);
      if (err.message) {
        this.error.emit((<ErrorDTO>err).message);
      }
    }
    return false;
  }


}



