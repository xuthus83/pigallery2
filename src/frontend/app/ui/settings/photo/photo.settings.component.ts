import {Component} from '@angular/core';
import {PhotoSettingsService} from './photo.settings.service';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {ClientConfig} from '../../../../../common/config/public/ConfigClass';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {ScheduledJobsService} from '../scheduled-jobs.service';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';
import {Utils} from '../../../../../common/Utils';
import {DefaultsJobs, JobDTO} from '../../../../../common/entities/job/JobDTO';
import {ErrorDTO} from '../../../../../common/entities/Error';
import {JobProgressStates} from '../../../../../common/entities/job/JobProgressDTO';


@Component({
  selector: 'app-settings-photo',
  templateUrl: './photo.settings.component.html',
  styleUrls: ['./photo.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [PhotoSettingsService],
})
export class PhotoSettingsComponent extends SettingsComponent<{
  photoProcessingLibrary: ServerConfig.PhotoProcessingLib,
  server: ServerConfig.PhotoConfig,
  client: ClientConfig.PhotoConfig
}> {
  resolutions = [720, 1080, 1440, 2160, 4320];
  PhotoProcessingLib = ServerConfig.PhotoProcessingLib;
  JobProgressStates = JobProgressStates;

  libTypes = Utils
    .enumToArray(ServerConfig.PhotoProcessingLib).map((v) => {
      if (v.value.toLowerCase() === 'sharp') {
        v.value += ' ' + this.i18n('(recommended)');
      } else {
        v.value += ' ' + this.i18n('(deprecated, will be removed)');
      }
      return v;
    });

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: PhotoSettingsService,
              public jobsService: ScheduledJobsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Photo'), _authService, _navigation, _settingsService, notification, i18n, s => ({
      photoProcessingLibrary: s.Server.Media.photoProcessingLibrary,
      client: s.Client.Media.Photo,
      server: s.Server.Media.Photo
    }));
    const currentRes = _settingsService.Settings.value.Server.Media.Photo.Converting.resolution;
    if (this.resolutions.indexOf(currentRes) === -1) {
      this.resolutions.push(currentRes);
    }
  }


  get Progress() {
    return this.jobsService.progress.value[JobDTO.getHashName(DefaultsJobs[DefaultsJobs['Photo Converting']])];
  }

  async convertPhoto() {
    this.inProgress = true;
    this.error = '';
    try {
      await this.jobsService.start(DefaultsJobs[DefaultsJobs['Photo Converting']]);
      this.notification.info(this.i18n('Photo converting started'));
      return true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    } finally {
      this.inProgress = false;
    }

    return false;
  }

  async cancelPhotoConverting() {
    this.inProgress = true;
    this.error = '';
    try {
      await this.jobsService.stop(DefaultsJobs[DefaultsJobs['Photo Converting']]);
      this.notification.info(this.i18n('Photo converting interrupted'));
      return true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<ErrorDTO>err).message;
      }
    } finally {
      this.inProgress = false;
    }

    return false;
  }
}



