import {Component, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {IndexingSettingsService} from "./indexing.settings.service";
import {AuthenticationService} from "../../model/network/authentication.service";
import {NavigationService} from "../../model/navigation.service";
import {NotificationService} from "../../model/notification.service";
import {ErrorDTO} from "../../../../common/entities/Error";
import {UserRoles} from "../../../../common/entities/UserDTO";
import {Observable} from "rxjs/Rx";

@Component({
  selector: 'settings-indexing',
  templateUrl: './indexing.settings.component.html',
  styleUrls: ['./indexing.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [IndexingSettingsService],
})
export class IndexingSettingsComponent implements OnInit, OnDestroy {

  @Input()
  public simplifiedMode: boolean = true;
  @Output('hasAvailableSettings')
  hasAvailableSettings: boolean = true;
  public inProgress = false;
  public error: string = null;
  updateProgress = async () => {
    try {
      await this._settingsService.getProgress();
    } catch (err) {
      if (this.subscription.timer != null) {
        this.subscription.timer.unsubscribe();
        this.subscription.timer = null;
      }
    }
    if (this._settingsService.progress.value != null && this.subscription.timer == null) {
      if (!this.$counter) {
        this.$counter = Observable.interval(5000);
      }
      this.subscription.timer = this.$counter.subscribe((x) => this.updateProgress());
    }
    if (this._settingsService.progress.value == null && this.subscription.timer != null) {
      this.subscription.timer.unsubscribe();
      this.subscription.timer = null;
    }

  };
  private subscription: { timer: any, settings: any } = {
    timer: null,
    settings: null
  };
  private $counter: Observable<number> = null;

  constructor(private _authService: AuthenticationService,
              private _navigation: NavigationService,
              public _settingsService: IndexingSettingsService,
              private notification: NotificationService) {
  }

  async ngOnInit() {
    if (!this._authService.isAuthenticated() ||
      this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
    this.subscription.settings = this._settingsService.Settings.subscribe(() => {
      this.hasAvailableSettings = (this._settingsService.isSupported() || !this.simplifiedMode);
    });

    this.updateProgress();
  }

  ngOnDestroy() {
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
    this.error = "";
    try {
      await this._settingsService.index();
      this.updateProgress();
      this.notification.success("Folder indexed", "Success");
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

  async cancel() {
    this.inProgress = true;
    this.error = "";
    try {
      await this._settingsService.cancel();
      this.notification.success("Folder indexed", "Success");
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

  async reset() {
    this.inProgress = true;
    this.error = "";
    try {
      await this._settingsService.reset();
      this.notification.success('Database reset', "Success");
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



