import {Component, OnInit} from '@angular/core';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {ThumbnailSettingsService} from './thumbnail.settings.service';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';
import {DefaultsJobs} from '../../../../../common/entities/job/JobDTO';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {ScheduledJobsService} from '../scheduled-jobs.service';
import {JobState} from '../../../../../common/entities/job/JobProgressDTO';

@Component({
  selector: 'app-settings-thumbnail',
  templateUrl: './thumbnail.settings.component.html',
  styleUrls: ['./thumbnail.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [ThumbnailSettingsService],
})
export class ThumbnailSettingsComponent
    extends SettingsComponent<{ server: ServerConfig.ThumbnailConfig, client: ClientConfig.ThumbnailConfig }>
    implements OnInit {
  JobState = JobState;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: ThumbnailSettingsService,
              notification: NotificationService,
              public jobsService: ScheduledJobsService,
              i18n: I18n) {
    super(i18n('Thumbnail'), _authService, _navigation, _settingsService, notification, i18n, s => ({
      client: s.Client.Media.Thumbnail,
      server: s.Server.Media.Thumbnail
    }));
  }

  get ThumbnailSizes(): string {
    return this.settings.client.thumbnailSizes.join('; ');
  }

  set ThumbnailSizes(value: string) {
    value = value.replace(new RegExp(',', 'g'), ';');
    value = value.replace(new RegExp(' ', 'g'), ';');
    this.settings.client.thumbnailSizes = value.split(';')
        .map(s => parseInt(s, 10))
        .filter(i => !isNaN(i) && i > 0);
  }

  get Progress() {
    return this.jobsService.progress.value[DefaultsJobs[DefaultsJobs['Thumbnail Generation']]];
  }

  ngOnInit() {
    super.ngOnInit();
  }

  async startJob() {
    this.inProgress = true;
    this.error = '';
    try {
      await this.jobsService.start(DefaultsJobs[DefaultsJobs['Thumbnail Generation']], {sizes: this.original.client.thumbnailSizes[0]});
      this.notification.info(this.i18n('Thumbnail generation started'));
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

  async cancelJob() {
    this.inProgress = true;
    this.error = '';
    try {
      await this.jobsService.stop(DefaultsJobs[DefaultsJobs['Thumbnail Generation']]);
      this.notification.info(this.i18n('Thumbnail generation interrupted'));
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



