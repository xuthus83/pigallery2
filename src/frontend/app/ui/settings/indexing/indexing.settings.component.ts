import {Component, OnDestroy, OnInit} from '@angular/core';
import {IndexingSettingsService} from './indexing.settings.service';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {Utils} from '../../../../../common/Utils';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {ScheduledJobsService} from '../scheduled-jobs.service';
import {DefaultsJobs} from '../../../../../common/entities/job/JobDTO';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';
import {JobState} from '../../../../../common/entities/settings/JobProgressDTO';

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
  JobState = JobState;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: IndexingSettingsService,
              public jobsService: ScheduledJobsService,
              notification: NotificationService,
              i18n: I18n) {

    super(i18n('Folder indexing'),
      _authService,
      _navigation,
      _settingsService,
      notification,
      i18n,
      s => s.Server.Indexing);

  }

  get Progress() {
    return this.jobsService.progress.value[DefaultsJobs[DefaultsJobs.Indexing]];
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
    this.jobsService.unsubscribeFromProgress();
  }

  async ngOnInit() {
    super.ngOnInit();
    this.jobsService.subscribeToProgress();
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


  async index() {
    this.inProgress = true;
    this.error = '';
    try {
      await this.jobsService.start(DefaultsJobs[DefaultsJobs.Indexing]);
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
      await this.jobsService.stop(DefaultsJobs[DefaultsJobs.Indexing]);
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
      await this.jobsService.start(DefaultsJobs[DefaultsJobs['Database Reset']]);
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



