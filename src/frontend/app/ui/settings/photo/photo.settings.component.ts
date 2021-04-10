import {Component} from '@angular/core';
import {PhotoSettingsService} from './photo.settings.service';
import {SettingsComponentDirective} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {ScheduledJobsService} from '../scheduled-jobs.service';
import {DefaultsJobs, JobDTO} from '../../../../../common/entities/job/JobDTO';
import {JobProgressStates} from '../../../../../common/entities/job/JobProgressDTO';
import {ServerConfig} from '../../../../../common/config/private/PrivateConfig';
import {ClientConfig} from '../../../../../common/config/public/ClientConfig';


@Component({
  selector: 'app-settings-photo',
  templateUrl: './photo.settings.component.html',
  styleUrls: ['./photo.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [PhotoSettingsService],
})
export class PhotoSettingsComponent extends SettingsComponentDirective<{
  server: ServerConfig.PhotoConfig,
  client: ClientConfig.PhotoConfig
}> {
  readonly resolutionTypes = [720, 1080, 1440, 2160, 4320];
  resolutions: { key: number, value: string }[] = [];
  JobProgressStates = JobProgressStates;

  readonly jobName = DefaultsJobs[DefaultsJobs['Photo Converting']];

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: PhotoSettingsService,
              public jobsService: ScheduledJobsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Photo'), _authService, _navigation, _settingsService, notification, i18n, s => ({
      client: s.Client.Media.Photo,
      server: s.Server.Media.Photo
    }));
    const currentRes = _settingsService.Settings.value.Server.Media.Photo.Converting.resolution;
    if (this.resolutionTypes.indexOf(currentRes) === -1) {
      this.resolutionTypes.push(currentRes);
    }
    this.resolutions = this.resolutionTypes.map(e => ({key: e, value: e + 'px'}));
  }

  get Progress() {
    return this.jobsService.progress.value[JobDTO.getHashName(DefaultsJobs[DefaultsJobs['Photo Converting']])];
  }

  libTypesMap = (v: { key: number, value: string }) => {
    if (v.value.toLowerCase() === 'sharp') {
      v.value += ' ' + this.i18n('(recommended)');
    } else {
      v.value += ' ' + this.i18n('(deprecated, will be removed)');
    }
    return v;
  };
}



