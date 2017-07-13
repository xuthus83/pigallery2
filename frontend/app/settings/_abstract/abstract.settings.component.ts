import {OnDestroy, OnInit, ViewChild} from "@angular/core";
import {AuthenticationService} from "../../model/network/authentication.service";
import {UserRoles} from "../../../../common/entities/UserDTO";
import {Utils} from "../../../../common/Utils";
import {Error} from "../../../../common/entities/Error";
import {NotificationService} from "../../model/notification.service";
import {NavigationService} from "../../model/navigation.service";
import {ISettingsService} from "./abstract.settings.service";


export abstract class SettingsComponent<T> implements OnInit, OnDestroy {

  @ViewChild('settingsForm') form;
  public settings: T;
  public inProgress = false;
  private original: T;
  public tested = false;
  public error: string = null;
  public changed: boolean = false;
  private subscription;

  constructor(private name,
              private _authService: AuthenticationService,
              private _navigation: NavigationService,
              protected _settingsService: ISettingsService<T>,
              private notification: NotificationService) {
  }

  ngOnInit() {
    if (!this._authService.isAuthenticated() ||
      this._authService.user.value.role < UserRoles.Admin) {
      this._navigation.toLogin();
      return;
    }
    this.original = Utils.clone(this.settings);
    this.getSettings();

    this.subscription = this.form.valueChanges.subscribe((data) => {
      this.changed = !Utils.equalsFilter(this.settings, this.original);

      this.tested = false;
    });
  }

  ngOnDestroy() {
    if (this.subscription != null) {
      this.subscription.unsubscribe();
    }
  }

  private async getSettings() {
    const s = await this._settingsService.getSettings();
    this.original = Utils.clone(s);
    this.settings = s;
    this.tested = false;
    this.changed = false;
  }

  public reset() {
    this.getSettings();
  }


  public async test() {
    this.inProgress = true;
    try {
      this.error = "";
      await this._settingsService.testSettings(this.settings);
      this.tested = true;
    } catch (err) {
      console.log(err);
      if (err.message) {
        this.error = (<Error>err).message;
      }
    }
    this.inProgress = false;
  }

  public async save() {
    if (!this.tested) {
      return;
    }
    this.inProgress = true;
    await this._settingsService.updateSettings(this.settings);
    await this.getSettings();
    this.notification.success(this.name + ' settings saved', "Success");
    this.inProgress = false;
  }

}



