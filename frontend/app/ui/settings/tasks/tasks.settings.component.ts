import {Component, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {TasksSettingsService} from './tasks.settings.service';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {TaskConfig} from '../../../../../common/config/private/IPrivateConfig';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {ScheduledTasksService} from '../scheduled-tasks.service';
import {
  NeverTaskTrigger,
  PeriodicTaskTrigger,
  ScheduledTaskTrigger,
  TaskScheduleDTO,
  TaskTriggerType
} from '../../../../../common/entities/task/TaskScheduleDTO';
import {Utils} from '../../../../../common/Utils';

@Component({
  selector: 'app-settings-tasks',
  templateUrl: './tasks.settings.component.html',
  styleUrls: ['./tasks.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [TasksSettingsService]
})
export class TasksSettingsComponent extends SettingsComponent<TaskConfig, TasksSettingsService>
  implements OnInit, OnDestroy, OnChanges {

  disableButtons = false;
  taskTriggerType: { key: number, value: string }[];
  TaskTriggerType = TaskTriggerType;
  periods: string[] = [];

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: TasksSettingsService,
              public tasksService: ScheduledTasksService,
              notification: NotificationService,
              i18n: I18n) {

    super(i18n('Tasks'),
      _authService,
      _navigation,
      <any>_settingsService,
      notification,
      i18n,
      s => s.Server.tasks);
    this.hasAvailableSettings = !this.simplifiedMode;
    this.taskTriggerType = Utils.enumToArray(TaskTriggerType);
    this.periods = [this.i18n('Monday'),
      this.i18n('Tuesday'),
      this.i18n('Wednesday'),
      this.i18n('Thursday'),
      this.i18n('Friday'),
      this.i18n('Saturday'),
      this.i18n('Sunday'),
      this.i18n('day')];
  }


  ngOnChanges(): void {
    this.hasAvailableSettings = !this.simplifiedMode;
  }

  getConfigTemplate(taskName: string) {
    const task = this._settingsService.availableTasks.value.find(t => t.Name === taskName);
    if (task && task.ConfigTemplate && task.ConfigTemplate.length > 0) {
      const schedule = this.settings.scheduled.find(s => s.taskName === taskName);
      if (schedule) {
        schedule.config = schedule.config || {};
        task.ConfigTemplate.forEach(ct => schedule.config[ct.id] = ct.defaultValue);
      }
      return task.ConfigTemplate;
    }
    return null;
  }

  ngOnInit() {
    super.ngOnInit();
    this.tasksService.subscribeToProgress();
    this._settingsService.getAvailableTasks();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.tasksService.unsubscribeFromProgress();
  }

  getTimeLeft(id: string): number {
    const prg = this.tasksService.progress.value[id];
    if (!prg) {
      return null;
    }
    return (prg.time.current - prg.time.start) / prg.progress * prg.left;
  }

  getTimeElapsed(id: string) {
    const prg = this.tasksService.progress.value[id];
    if (!prg) {
      return null;
    }
    return (prg.time.current - prg.time.start);
  }


  public async start(schedule: TaskScheduleDTO) {
    this.error = '';
    try {
      this.disableButtons = true;
      await this.tasksService.start(schedule.taskName, schedule.config);
      await this.tasksService.forceUpdate();
      this.notification.info(this.i18n('Task') + ' ' + schedule.taskName + ' ' + this.i18n('started'));
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

  public async stop(schedule: TaskScheduleDTO) {
    this.error = '';
    try {
      this.disableButtons = true;
      await this.tasksService.stop(schedule.taskName);
      await this.tasksService.forceUpdate();
      this.notification.info(this.i18n('Task') + ' ' + schedule.taskName + ' ' + this.i18n('stopped'));
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

  remove(id: string) {

  }

  update($event: string, trigger: ScheduledTaskTrigger) {
    if (!$event) {
      return;
    }
    console.log(typeof $event);
    console.log($event);
    console.log(new Date($event));
    console.log(new Date($event).getTime());
    trigger.time = new Date($event).getTime();
  }

  toDate(time: number) {
    return new Date(time);
  }

  taskTriggerTypeChanged(triggerType: TaskTriggerType, schedule: TaskScheduleDTO) {
    schedule.trigger = <NeverTaskTrigger>{type: triggerType};
    switch (triggerType) {
      case TaskTriggerType.scheduled:
        (<ScheduledTaskTrigger><unknown>schedule.trigger).time = (Date.now());
        break;

      case TaskTriggerType.periodic:
        (<PeriodicTaskTrigger><unknown>schedule.trigger).periodicity = null;
        (<PeriodicTaskTrigger><unknown>schedule.trigger).atTime = null;
        break;
    }
  }
}



