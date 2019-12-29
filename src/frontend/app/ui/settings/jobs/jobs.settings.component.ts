import {Component, OnChanges, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {JobsSettingsService} from './jobs.settings.service';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {ScheduledJobsService} from '../scheduled-jobs.service';
import {
  AfterJobTrigger,
  JobScheduleDTO,
  JobTriggerType,
  NeverJobTrigger,
  PeriodicJobTrigger,
  ScheduledJobTrigger
} from '../../../../../common/entities/job/JobScheduleDTO';
import {Utils} from '../../../../../common/Utils';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';
import {ConfigTemplateEntry, JobDTO} from '../../../../../common/entities/job/JobDTO';
import {Job} from '../../../../../backend/model/jobs/jobs/Job';
import {ModalDirective} from 'ngx-bootstrap/modal';
import {JobProgressStates} from '../../../../../common/entities/job/JobProgressDTO';
import {BackendtextService} from '../../../model/backendtext.service';

@Component({
  selector: 'app-settings-jobs',
  templateUrl: './jobs.settings.component.html',
  styleUrls: ['./jobs.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [JobsSettingsService]
})
export class JobsSettingsComponent extends SettingsComponent<ServerConfig.JobConfig, JobsSettingsService>
  implements OnInit, OnDestroy, OnChanges {

  @ViewChild('jobModal', {static: false}) public jobModal: ModalDirective;
  disableButtons = false;
  JobTriggerTypeMap: { key: number, value: string }[];
  JobTriggerType = JobTriggerType;
  periods: string[] = [];
  showDetails: boolean[] = [];
  JobProgressStates = JobProgressStates;
  newSchedule: JobScheduleDTO = {
    name: '',
    config: null,
    jobName: '',
    trigger: {
      type: JobTriggerType.never
    }
  };

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: JobsSettingsService,
              public jobsService: ScheduledJobsService,
              public backendtextService: BackendtextService,
              notification: NotificationService,
              i18n: I18n) {

    super(i18n('Jobs'),
      _authService,
      _navigation,
      _settingsService,
      notification,
      i18n,
      s => s.Server.Jobs);

    this.hasAvailableSettings = !this.simplifiedMode;
    this.JobTriggerTypeMap = Utils.enumToArray(JobTriggerType);
    this.periods = [this.i18n('Monday'), // 0
      this.i18n('Tuesday'), // 1
      this.i18n('Wednesday'), // 2
      this.i18n('Thursday'),
      this.i18n('Friday'),
      this.i18n('Saturday'),
      this.i18n('Sunday'),
      this.i18n('day')]; // 7
  }

  getConfigTemplate(JobName: string): ConfigTemplateEntry[] {
    const job = this._settingsService.availableJobs.value.find(t => t.Name === JobName);
    if (job && job.ConfigTemplate && job.ConfigTemplate.length > 0) {
      return job.ConfigTemplate;
    }
    return null;
  }

  ngOnInit() {
    super.ngOnInit();
    this.jobsService.subscribeToProgress();
    this._settingsService.getAvailableJobs();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.jobsService.unsubscribeFromProgress();
  }

  public async start(schedule: JobScheduleDTO) {
    this.error = '';
    try {
      this.disableButtons = true;
      await this.jobsService.start(schedule.jobName, schedule.config);
      this.notification.info(this.i18n('Job') + ' ' + schedule.jobName + ' ' + this.i18n('started'));
      return true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    } finally {
      this.disableButtons = false;
    }

    return false;
  }

  public async stop(schedule: JobScheduleDTO) {
    this.error = '';
    try {
      this.disableButtons = true;
      await this.jobsService.stop(schedule.jobName);
      this.notification.info(this.i18n('Job') + ' ' + schedule.jobName + ' ' + this.i18n('stopped'));
      return true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    } finally {
      this.disableButtons = false;
    }

    return false;
  }

  remove(index: number) {
    this.settings.scheduled.splice(index, 1);
  }

  jobTypeChanged(schedule: JobScheduleDTO) {
    const job = this._settingsService.availableJobs.value.find(t => t.Name === schedule.jobName);
    schedule.config = schedule.config || {};
    if (job.ConfigTemplate) {
      job.ConfigTemplate.forEach(ct => schedule.config[ct.id] = ct.defaultValue);
    }
  }

  prepareNewJob() {
    const jobName = this._settingsService.availableJobs.value[0].Name;
    this.newSchedule = {
      name: 'new job',
      jobName: jobName,
      config: <any>{},
      trigger: {
        type: JobTriggerType.never
      }
    };

    const job = this._settingsService.availableJobs.value.find(t => t.Name === jobName);
    this.newSchedule.config = this.newSchedule.config || {};
    if (job.ConfigTemplate) {
      job.ConfigTemplate.forEach(ct => this.newSchedule.config[ct.id] = ct.defaultValue);
    }

    this.jobModal.show();
  }

  jobTriggerTypeChanged(triggerType: JobTriggerType, schedule: JobScheduleDTO) {
    schedule.trigger = <NeverJobTrigger>{type: triggerType};
    switch (triggerType) {
      case JobTriggerType.scheduled:
        (<ScheduledJobTrigger><unknown>schedule.trigger).time = (Date.now());
        break;

      case JobTriggerType.periodic:
        (<PeriodicJobTrigger><unknown>schedule.trigger).periodicity = null;
        (<PeriodicJobTrigger><unknown>schedule.trigger).atTime = null;
        break;
    }
  }

  setNumberArray(configElement: any, id: string, value: string) {
    console.log(value);
    console.log(configElement[id]);
    value = value.replace(new RegExp(',', 'g'), ';');
    value = value.replace(new RegExp(' ', 'g'), ';');
    configElement[id] = value.split(';')
      .map((s: string) => parseInt(s, 10))
      .filter((i: number) => !isNaN(i) && i > 0);
  }

  getNumberArray(configElement: any, id: string) {

    return configElement[id].join('; ');
  }

  public shouldIdent(curr: JobScheduleDTO, prev: JobScheduleDTO) {
    return curr && curr.trigger.type === JobTriggerType.after && prev && prev.name === curr.trigger.afterScheduleName;
  }

  public sortedSchedules() {
    return this.settings.scheduled.slice().sort((a, b) => {
      return this.getNextRunningDate(a, this.settings.scheduled) - this.getNextRunningDate(b, this.settings.scheduled);
    });
  }

  addNewJob() {
    const jobName = this.newSchedule.jobName;
    const count = this.settings.scheduled.filter(s => s.jobName === jobName).length;
    this.newSchedule.name = count === 0 ? jobName : jobName + ' ' + (count + 1);
    this.settings.scheduled.push(this.newSchedule);
    this.jobModal.hide();
  }

  getConfigHash(schedule: JobScheduleDTO): string {
    return JSON.stringify(schedule.config);
  }

  getProgress(schedule: JobScheduleDTO) {
    return this.jobsService.progress.value[JobDTO.getHashName(schedule.jobName, schedule.config)];
  }

  getLastRun(schedule: JobScheduleDTO) {
    return this.jobsService.lastRuns.value[JobDTO.getHashName(schedule.jobName, schedule.config)];
  }

  private getNextRunningDate(sch: JobScheduleDTO, list: JobScheduleDTO[], depth: number = 0): number {
    if (depth > list.length) {
      return 0;
    }
    if (sch.trigger.type === JobTriggerType.never) {
      return list.map(s => s.name).sort().indexOf(sch.name) * -1;
    }
    if (sch.trigger.type === JobTriggerType.after) {
      const parent = list.find(s => s.name === (<AfterJobTrigger>sch.trigger).afterScheduleName);
      if (parent) {
        return this.getNextRunningDate(parent, list, depth + 1) + 0.001;
      }
    }
    const d = JobScheduleDTO.getNextRunningDate(new Date(), sch);
    return d !== null ? d.getTime() : 0;
  }
}



