import {Input, OnChanges, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {AuthenticationService} from "../../model/network/authentication.service";
import {UserRoles} from "../../../../common/entities/UserDTO";
import {Utils} from "../../../../common/Utils";
import {ErrorDTO} from "../../../../common/entities/Error";
import {NotificationService} from "../../model/notification.service";
import {NavigationService} from "../../model/navigation.service";
import {AbstractSettingsService} from "./abstract.settings.service";
import {IPrivateConfig} from "../../../../common/config/private/IPrivateConfig";


export abstract class SettingsComponent<T> implements OnInit, OnDestroy, OnChanges {

  @Input()
  public simplifiedMode: boolean = true;

  @ViewChild('settingsForm')
  form: HTMLFormElement;

  @Output('hasAvailableSettings')
  hasAvailableSettings: boolean = true;

  public inProgress = false;
  public error: string = null;
  public changed: boolean = false;
  private subscription = null;
  private settingsSubscription = null;

  public settings: T = <any>{};
  public original: T = <any>{};

  constructor(private name,
              private _authService: AuthenticationService,
              private _navigation: NavigationService,
              public _settingsService: AbstractSettingsService<T>,
              protected notification: NotificationService,
              private sliceFN: (s: IPrivateConfig) => T) {
    this.settingsSubscription = this._settingsService.Settings.subscribe(this.onNewSettings);
    this.onNewSettings(this._settingsService._settingsService.settings.value);
  }

  onNewSettings = (s) => {
    this.settings = Utils.clone(this.sliceFN(s));
    this.original = Utils.clone(this.settings);
    this.ngOnChanges();
  };

  ngOnInit() {
    if (!this._authService.isAuthenticated() ||
      this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
    this.getSettings();

    this.subscription = this.form.valueChanges.subscribe((data) => {
      this.changed = !Utils.equalsFilter(this.settings, this.original);
    });

  }

  ngOnChanges(): void {
    this.hasAvailableSettings = (this._settingsService.isSupported() || !this.simplifiedMode);
  }


  ngOnDestroy() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
    if (this.settingsSubscription != null) {
      this.settingsSubscription.unsubscribe();
    }
  }

  private async getSettings() {
    await this._settingsService.getSettings();
    this.changed = false;
  }

  public reset() {
    this.getSettings();
  }


  public async save() {
    this.inProgress = true;
    this.error = "";
    try {
      await this._settingsService.updateSettings(this.settings);
      await this.getSettings();
      this.notification.success(this.name + ' settings saved', "Success");
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



