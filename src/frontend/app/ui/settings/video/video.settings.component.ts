import {Component} from '@angular/core';
import {VideoSettingsService} from './video.settings.service';
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
  selector: 'app-settings-video',
  templateUrl: './video.settings.component.html',
  styleUrls: ['./video.settings.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [VideoSettingsService],
})
export class VideoSettingsComponent extends SettingsComponentDirective<{ server: ServerConfig.VideoConfig, client: ClientConfig.VideoConfig }> {

  readonly resolutionTypes: ServerConfig.resolutionType[] = [360, 480, 720, 1080, 1440, 2160, 4320];

  resolutions: { key: number, value: string }[] = [];
  codecs: { [key: string]: { key: ServerConfig.codecType, value: ServerConfig.codecType }[] } = {
    webm: ['libvpx', 'libvpx-vp9'].map((e: ServerConfig.codecType) => ({key: e, value: e})),
    mp4: ['libx264', 'libx265'].map((e: ServerConfig.codecType) => ({key: e, value: e}))
  };
  formats: { key: ServerConfig.formatType, value: ServerConfig.formatType }[] = ['mp4', 'webm']
    .map((e: ServerConfig.formatType) => ({key: e, value: e}));
  fps = [24, 25, 30, 48, 50, 60].map(e => ({key: e, value: e}));

  JobProgressStates = JobProgressStates;
  readonly jobName = DefaultsJobs[DefaultsJobs['Video Converting']];

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: VideoSettingsService,
              public jobsService: ScheduledJobsService,
              notification: NotificationService,
              i18n: I18n) {
    super(i18n('Video'), _authService, _navigation, _settingsService, notification, i18n, s => ({
      client: s.Client.Media.Video,
      server: s.Server.Media.Video
    }));

    const currentRes = _settingsService.Settings.value.Server.Media.Video.transcoding.resolution;
    if (this.resolutionTypes.indexOf(currentRes) === -1) {
      this.resolutionTypes.push(currentRes);
    }
    this.resolutions = this.resolutionTypes.map(e => ({key: e, value: e + 'px'}));
  }


  get Progress() {
    return this.jobsService.progress.value[JobDTO.getHashName(DefaultsJobs[DefaultsJobs['Video Converting']])];
  }

  get bitRate(): number {
    return this.states.server.transcoding.bitRate.value / 1024 / 1024;
  }

  set bitRate(value: number) {
    this.states.server.transcoding.bitRate.value = Math.round(value * 1024 * 1024);
  }

  getRecommendedBitRate(resolution: number, fps: number) {
    let bitRate = 1024 * 1024;
    if (resolution <= 360) {
      bitRate = 1024 * 1024;
    } else if (resolution <= 480) {
      bitRate = 2.5 * 1024 * 1024;
    } else if (resolution <= 720) {
      bitRate = 5 * 1024 * 1024;
    } else if (resolution <= 1080) {
      bitRate = 8 * 1024 * 1024;
    } else if (resolution <= 1440) {
      bitRate = 16 * 1024 * 1024;
    } else {
      bitRate = 40 * 1024 * 1024;
    }

    if (fps > 30) {
      bitRate *= 1.5;
    }

    return bitRate;
  }

  updateBitRate() {
    this.states.server.transcoding.bitRate.value = this.getRecommendedBitRate(this.states.server.transcoding.resolution.value,
      this.states.server.transcoding.fps.value);
  }

  formatChanged(format: ServerConfig.formatType) {
    this.states.server.transcoding.codec.value = this.codecs[format][0].key;
  }


}



