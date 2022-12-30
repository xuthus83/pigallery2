import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {SettingsComponentDirective} from '../_abstract/abstract.settings.component';
import {SettingsService} from '../settings.service';
import {WebConfig} from '../../../../../common/config/private/WebConfig';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {JobProgressDTO} from '../../../../../common/entities/job/JobProgressDTO';
import {JobDTOUtils} from '../../../../../common/entities/job/JobDTO';
import {ScheduledJobsService} from '../scheduled-jobs.service';


@Component({
  selector: 'app-settings-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css',
    '../_abstract/abstract.settings.component.css']
})
export class TemplateComponent extends SettingsComponentDirective<any> implements OnInit {


  constructor(
    authService: AuthenticationService,
    navigation: NavigationService,
    notification: NotificationService,
    settingsService: AbstractSettingsService,
    globalSettingsService: SettingsService,
    public jobsService: ScheduledJobsService,
  ) {
    super(
      authService,
      navigation,
      settingsService,
      notification,
      globalSettingsService
    );

  }


  ngOnInit(): void {
    super.ngOnInit();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!this.ConfigPath) {
      this.setSliceFN(c => ({value: c, isConfigType: true, type: WebConfig}));
    } else {
      this.setSliceFN(c => c.__state[this.ConfigPath]);
    }
    this.name = this.states.tags?.name || this.ConfigPath;
  }

  getKeys(states: any) {
    const s = states.value.__state;
    return Object.keys(s).sort((a, b) => {
      if ((s[a].isConfigType || s[a].isConfigArrayType) !== (s[b].isConfigType || s[b].isConfigArrayType)) {
        if (s[a].isConfigType || s[a].isConfigArrayType) {
          return 1;
        } else {
          return -1;
        }
      }
      if (s[a].tags?.priority !== s[b].tags?.priority) {
        return s[a].tags?.priority - s[b].tags?.priority;
      }

      return (s[a].tags?.name as string || a).localeCompare(s[b].tags?.name || b);

    });
  }

  getProgress(jobName: string): JobProgressDTO {
    return this.jobsService.progress.value[JobDTOUtils.getHashName(jobName)];
  }
}
