import {Component, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {TasksSettingsService} from './tasks.settings.service';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
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
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';
import {ConfigTemplateEntry} from '../../../../../common/entities/task/TaskDTO';

@Component({
  selector: 'app-settings-tasks',
  templateUrl: './tasks.settings.component.html',
  styleUrls: ['./tasks.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [TasksSettingsService]
})
export class TasksSettingsComponent extends SettingsComponent<ServerConfig.TaskConfig, TasksSettingsService>
  implements OnInit, OnDestroy, OnChanges {

  disableButtons = false;
  taskTriggerType: { key: number, value: string }[];
  TaskTriggerType = TaskTriggerType;
  periods: string[] = [];
  showDetails: boolean[] = [];

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
      s => s.Server.Tasks);

    this.hasAvailableSettings = !this.simplifiedMode;
    this.taskTriggerType = Utils.enumToArray(TaskTriggerType);
    this.periods = [this.i18n('Monday'), // 0
      this.i18n('Tuesday'), // 1
      this.i18n('Wednesday'), // 2
      this.i18n('Thursday'),
      this.i18n('Friday'),
      this.i18n('Saturday'),
      this.i18n('Sunday'),
      this.i18n('day')]; // 7
  }


  ngOnChanges(): void {
    this.hasAvailableSettings = !this.simplifiedMode;
  }

  getConfigTemplate(taskName: string): ConfigTemplateEntry[] {
    const task = this._settingsService.availableTasks.value.find(t => t.Name === taskName);
    if (task && task.ConfigTemplate && task.ConfigTemplate.length > 0) {
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

  remove(index: number) {
    this.settings.scheduled.splice(index, 1);
  }

  addNewTask() {
    const taskName = this._settingsService.availableTasks.value[0].Name;
    const newSchedule: TaskScheduleDTO = {
      taskName: taskName,
      config: <any>{},
      trigger: {
        type: TaskTriggerType.never
      }
    };

    const task = this._settingsService.availableTasks.value.find(t => t.Name === taskName);
    newSchedule.config = newSchedule.config || {};
    task.ConfigTemplate.forEach(ct => newSchedule.config[ct.id] = ct.defaultValue);
    this.settings.scheduled.push(newSchedule);
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



