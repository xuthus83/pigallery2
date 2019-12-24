import {Component, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {JobsSettingsService} from './jobs.settings.service';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {ScheduledJobsService} from '../scheduled-jobs.service';
import {
  NeverJobTrigger,
  PeriodicJobTrigger,
  ScheduledJobTrigger,
  JobScheduleDTO,
  JobTriggerType
} from '../../../../../common/entities/job/JobScheduleDTO';
import {Utils} from '../../../../../common/Utils';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';
import {ConfigTemplateEntry} from '../../../../../common/entities/job/JobDTO';
import {JobState} from '../../../../../common/entities/settings/JobProgressDTO';

@Component({
  selector: 'app-settings-jobs',
  templateUrl: './jobs.settings.component.html',
  styleUrls: ['./jobs.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [JobsSettingsService]
})
export class JobsSettingsComponent extends SettingsComponent<ServerConfig.JobConfig, JobsSettingsService>
  implements OnInit, OnDestroy, OnChanges {

  disableButtons = false;
  JobTriggerTypeMap: { key: number, value: string }[];
  JobTriggerType = JobTriggerType;
  periods: string[] = [];
  showDetails: boolean[] = [];
  JobState = JobState;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: JobsSettingsService,
              public jobsService: ScheduledJobsService,
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
    job.ConfigTemplate.forEach(ct => schedule.config[ct.id] = ct.defaultValue);
  }

  addNewJob() {
    const jobName = this._settingsService.availableJobs.value[0].Name;
    const newSchedule: JobScheduleDTO = {
      jobName: jobName,
      config: <any>{},
      trigger: {
        type: JobTriggerType.never
      }
    };

    const job = this._settingsService.availableJobs.value.find(t => t.Name === jobName);
    newSchedule.config = newSchedule.config || {};
    job.ConfigTemplate.forEach(ct => newSchedule.config[ct.id] = ct.defaultValue);
    this.settings.scheduled.push(newSchedule);
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
    console.log(configElement[id]);
  }

  getNumberArray(configElement: any, id: string) {

    return configElement[id].join('; ');
  }

}



