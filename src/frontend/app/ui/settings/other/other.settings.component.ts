import {Component, OnChanges} from '@angular/core';
import {SettingsComponentDirective} from '../_abstract/abstract.settings.component';
import {AuthenticationService} from '../../../model/network/authentication.service';
import {NavigationService} from '../../../model/navigation.service';
import {NotificationService} from '../../../model/notification.service';
import {OtherSettingsService} from './other.settings.service';
import {Utils} from '../../../../../common/Utils';
import {SortingMethods} from '../../../../../common/entities/SortingMethods';
import {StringifySortingMethod} from '../../../pipes/StringifySortingMethod';
import {ConfigPriority} from '../../../../../common/config/public/ClientConfig';
import {SettingsService} from '../settings.service';

@Component({
  selector: 'app-settings-other',
  templateUrl: './other.settings.component.html',
  styleUrls: [
    './other.settings.component.css',
    '../_abstract/abstract.settings.component.css',
  ],
  providers: [OtherSettingsService],
})
export class OtherSettingsComponent
  extends SettingsComponentDirective<any>
  implements OnChanges {
  types: { key: number; value: string }[] = [];
  threads: { key: number; value: string }[] = [
    {key: 0, value: 'auto'},
  ].concat(Utils.createRange(1, 100).map((v) => ({key: v, value: '' + v})));
  sortingMap: any;

  constructor(
    authService: AuthenticationService,
    navigation: NavigationService,
    settingsService: OtherSettingsService,
    notification: NotificationService,
    private formatter: StringifySortingMethod,
    globalSettingsService: SettingsService
  ) {
    super(
      $localize`Other`,
      'target',
      authService,
      navigation,
      settingsService,
      notification,
      globalSettingsService,
      (s) => ({
        Server: s.Gallery,
      })
    );
    this.sortingMap = (v: { key: number; value: string }) => {
      v.value = this.formatter.transform(v.key);
      return v;
    };
    this.types = Utils.enumToArray(SortingMethods);
    this.hasAvailableSettings = this.configPriority > ConfigPriority.basic;
  }

  ngOnChanges(): void {
    this.hasAvailableSettings = this.configPriority > ConfigPriority.basic;
  }

  public async save(): Promise<boolean> {
    const val = await super.save();
    if (val === true) {
      this.notification.info(
        $localize`Restart the server to apply the new settings`,
        $localize`Info`
      );
    }
    return val;
  }
}



