import {OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AuthenticationService} from "../../model/network/authentication.service";
import {UserRoles} from "../../../../common/entities/UserDTO";
import {Utils} from "../../../../common/Utils";
import {ErrorDTO} from "../../../../common/entities/Error";
import {NotificationService} from "../../model/notification.service";
import {NavigationService} from "../../model/navigation.service";
import {AbstractSettingsService} from "./abstract.settings.service";


export abstract class SettingsComponent<T> implements OnInit, OnDestroy {

  @ViewChild('settingsForm') form;
  public inProgress = false;
  public error: string = null;
  public changed: boolean = false;
  private subscription = null;

  constructor(private name,
              private _authService: AuthenticationService,
              private _navigation: NavigationService,
              public _settingsService: AbstractSettingsService<T>,
              protected notification: NotificationService) {
  }

  ngOnInit() {
    if (!this._authService.isAuthenticated() ||
      this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
    this.getSettings();

    this.subscription = this.form.valueChanges.subscribe((data) => {
      this.changed = !Utils.equalsFilter(this._settingsService.settings, this._settingsService.original);
    });
  }

  ngOnDestroy() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
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
      await this._settingsService.updateSettings(this._settingsService.settings);
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



