import {Component} from '@angular/core';
import {IndexingSettingsService} from './indexing.settings.service';
import {AuthenticationService} from '../../model/network/authentication.service';
import {NavigationService} from '../../model/navigation.service';
import {NotificationService} from '../../model/notification.service';
import {ErrorDTO} from '../../../../common/entities/Error';
import {Observable} from 'rxjs/Rx';
import {IndexingConfig, ReIndexingSensitivity} from '../../../../common/config/private/IPrivateConfig';
import {SettingsComponent} from '../_abstract/abstract.settings.component';
import {Utils} from '../../../../common/Utils';
import {I18n} from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'settings-indexing',
  templateUrl: './indexing.settings.component.html',
  styleUrls: ['./indexing.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [IndexingSettingsService],
})
export class IndexingSettingsComponent extends SettingsComponent<IndexingConfig, IndexingSettingsService> {


  types: Array<any> = [];
  private subscription: { timer: any, settings: any } = {
    timer: null,
    settings: null
  };
  private $counter: Observable<number> = null;
  updateProgress = async () => {
    try {
      await (<IndexingSettingsService>this._settingsService).getProgress();
    } catch (err) {
      if (this.subscription.timer != null) {
        this.subscription.timer.unsubscribe();
        this.subscription.timer = null;
      }
    }
    if ((<IndexingSettingsService>this._settingsService).progress.value != null && this.subscription.timer == null) {
      if (!this.$counter) {
        this.$counter = Observable.interval(5000);
      }
      this.subscription.timer = this.$counter.subscribe((x) => this.updateProgress());
    }
    if ((<IndexingSettingsService>this._settingsService).progress.value == null && this.subscription.timer != null) {
      this.subscription.timer.unsubscribe();
      this.subscription.timer = null;
    }

  };

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: IndexingSettingsService,
              notification: NotificationService,
              i18n: I18n) {

    super(i18n('Indexing'), _authService, _navigation, <any>_settingsService, notification, i18n, s => s.Server.indexing);

  }

  async ngOnInit() {
    super.ngOnInit();
    this.types = Utils
      .enumToArray(ReIndexingSensitivity);
    this.updateProgress();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.subscription.timer != null) {
      this.subscription.timer.unsubscribe();
      this.subscription.timer = null;
    }
    if (this.subscription.settings != null) {
      this.subscription.settings.unsubscribe();
      this.subscription.settings = null;
    }
  }

  async index() {
    this.inProgress = true;
    this.error = '';
    try {
      await this._settingsService.index();
      this.updateProgress();
      this.notification.success(this.i18n('Folder indexed'), this.i18n('Success'));
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
      await (<IndexingSettingsService>this._settingsService).cancel();
      this.notification.success(this.i18n('Folder indexed'), this.i18n('Success'));
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
      await (<IndexingSettingsService>this._settingsService).reset();
      this.notification.success(this.i18n('Database reset'), this.i18n('Success'));
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



