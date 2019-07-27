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
import {TaskScheduleDTO} from '../../../../../common/entities/task/TaskScheduleDTO';

@Component({
  selector: 'app-settings-tasks',
  templateUrl: './tasks.settings.component.html',
  styleUrls: ['./tasks.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [TasksSettingsService],
})
export class TasksSettingsComponent extends SettingsComponent<TaskConfig, TasksSettingsService>
  implements OnInit, OnDestroy, OnChanges {

  disableButtons = false;

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

}



