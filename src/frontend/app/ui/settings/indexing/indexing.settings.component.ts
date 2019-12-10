import {Component, OnDestroy, OnInit} from '@angular/core';
import {IndexingSettingsService} from './indexing.settings.service';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {Utils} from '../../../../../common/Utils';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {ScheduledTasksService} from '../scheduled-tasks.service';
import {DefaultsTasks} from '../../../../../common/entities/task/TaskDTO';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';

@Component({
  selector: 'app-settings-indexing',
  templateUrl: './indexing.settings.component.html',
  styleUrls: ['./indexing.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [IndexingSettingsService],
})
export class IndexingSettingsComponent extends SettingsComponent<ServerConfig.IndexingConfig, IndexingSettingsService>
  implements OnInit, OnDestroy {


  types: { key: number; value: string }[] = [];

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: IndexingSettingsService,
              public tasksService: ScheduledTasksService,
              notification: NotificationService,
              i18n: I18n) {

    super(i18n('Indexing'),
      _authService,
      _navigation,
      <any>_settingsService,
      notification,
      i18n,
      s => s.Server.Indexing);

  }

  get Progress() {
    return this.tasksService.progress.value[DefaultsTasks[DefaultsTasks.Indexing]];
  }

  get excludeFolderList(): string {
    return this.settings.excludeFolderList.join(';');
  }

  set excludeFolderList(value: string) {
    this.settings.excludeFolderList = value.split(';');
  }

  get excludeFileList(): string {
    return this.settings.excludeFileList.join(';');
  }

  set excludeFileList(value: string) {
    this.settings.excludeFileList = value.split(';');
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.tasksService.unsubscribeFromProgress();
  }

  async ngOnInit() {
    super.ngOnInit();
    this.tasksService.subscribeToProgress();
    this.types = Utils
      .enumToArray(ServerConfig.ReIndexingSensitivity);
    this.types.forEach(v => {
      switch (v.value) {
        case 'low':
          v.value = this.i18n('low');
          break;
        case 'medium':
          v.value = this.i18n('medium');
          break;
        case 'high':
          v.value = this.i18n('high');
          break;
      }
    });
  }


  async index(createThumbnails: boolean) {
    this.inProgress = true;
    this.error = '';
    try {
      await this.tasksService.start(DefaultsTasks[DefaultsTasks.Indexing], {createThumbnails: !!createThumbnails});
      this.notification.info(this.i18n('Folder indexing started'));
      this.inProgress = false;
      return true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    }

    this.inProgress = false;
    return false;
  }

  async cancelIndexing() {
    this.inProgress = true;
    this.error = '';
    try {
      await this.tasksService.stop(DefaultsTasks[DefaultsTasks.Indexing]);
      this.notification.info(this.i18n('Folder indexing interrupted'));
      this.inProgress = false;
      return true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    }

    this.inProgress = false;
    return false;
  }

  async resetDatabase() {
    this.inProgress = true;
    this.error = '';
    try {
      await this.tasksService.start(DefaultsTasks[DefaultsTasks['Database Reset']]);
      this.notification.info(this.i18n('Resetting  database'));
      this.inProgress = false;
      return true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    }

    this.inProgress = false;
    return false;
  }


}



