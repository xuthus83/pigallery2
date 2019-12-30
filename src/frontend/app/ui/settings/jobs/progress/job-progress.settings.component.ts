import {Component, Input, OnChanges, OnDestroy, TemplateRef} from '@angular/core';
import {JobProgressDTO, JobProgressStates} from '../../../../../../common/entities/job/JobProgressDTO';
import {Subscription, timer} from 'rxjs';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {BackendtextService} from '../../../../model/backendtext.service';

@Component({
  selector: 'app-settings-job-progress',
  templateUrl: './job-progress.settings.component.html',
  styleUrls: ['./job-progress.settings.component.css']
})
export class JobProgressComponent implements OnDestroy, OnChanges {

  @Input() progress: JobProgressDTO;
  JobProgressStates = JobProgressStates;
  timeCurrentCopy: number;
  modalRef: BsModalRef;
  private timerSub: Subscription;

  constructor(private modalService: BsModalService,
              public backendTextService: BackendtextService,
              private i18n: I18n) {
  }

  get ProgressTitle(): string {
    if (!this.progress) {
      return '';
    }
    return this.i18n('processed') + ':' + this.progress.steps.processed + ' + ' + this.i18n('skipped') + ':'
      + this.progress.steps.skipped + ' / ' + this.i18n('all') + ':' + this.progress.steps.all;
  }

  get Name(): string {
    if (!this.progress) {
      return '';
    }
    return this.backendTextService.getJobName(this.progress.jobName);
  }

  get TimeAll(): number {
    if (!this.progress || this.progress.steps.processed === 0) {
      return 0;
    }
    return (this.progress.time.end - this.progress.time.start) /
      (this.progress.steps.processed) * (this.progress.steps.all - this.progress.steps.skipped);
  }

  get Running() {
    return this.progress && (this.progress.state === JobProgressStates.running || this.progress.state === JobProgressStates.cancelling);
  }

  get Stopped() {
    return this.progress && (this.progress.state !== JobProgressStates.running && this.progress.state !== JobProgressStates.cancelling);
  }

  get TimeLeft(): number {
    if (!this.progress) {
      return 0;
    }
    return (this.progress.time.end - this.progress.time.start) / this.progress.steps.all;
  }

  get TimeElapsed() {
    if (!this.progress) {
      return 0;
    }
    return (this.timeCurrentCopy - this.progress.time.start);
  }

  get State(): string {
    if (!this.progress) {
      return '';
    }
    switch (this.progress.state) {
      case JobProgressStates.running:
        return this.i18n('running');
      case JobProgressStates.cancelling:
        return this.i18n('cancelling');
      case JobProgressStates.canceled:
        return this.i18n('canceled');
      case JobProgressStates.interrupted:
        return this.i18n('interrupted');
      case JobProgressStates.finished:
        return this.i18n('finished');
      default:
        return 'unknown state';
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
  }

  ngOnChanges(): void {
    if (!this.progress) {
      return;
    }
    this.timeCurrentCopy = this.progress.time.end;
    if (!this.timerSub) {
      this.timerSub = timer(0, 1000).subscribe(() => {
        if (this.progress) {
          this.timeCurrentCopy += 1000;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
  }


}



