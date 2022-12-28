import {Component, Input, OnInit} from '@angular/core';
import {MapSettingsService} from '../map/map.settings.service';
import {TemplateSettingsService} from './template.settings.service';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {SettingsComponentDirective} from '../_abstract/abstract.settings.component';
import {ClientMapConfig} from '../../../../../common/config/public/ClientConfig';
import {ServerConfig} from '../../../../../common/config/private/PrivateConfig';
import {SettingsService} from '../settings.service';
import {WebConfig} from '../../../../../common/config/private/WebConfig';


@Component({
  selector: 'app-settings-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css',
    '../_abstract/abstract.settings.component.css'],
  providers: [TemplateSettingsService],
})
export class TemplateComponent extends SettingsComponentDirective<any> implements OnInit {

  @Input() ConfigPath: keyof ServerConfig;
  @Input() icon: string;
  public configKeys: string[] = [];

  constructor(
    authService: AuthenticationService,
    navigation: NavigationService,
    settingsService: TemplateSettingsService,
    notification: NotificationService,
    globalSettingsService: SettingsService
  ) {
    super(
      `Template`,
      '',
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

}
