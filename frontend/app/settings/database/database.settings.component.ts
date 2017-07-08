import {Component, OnInit, ViewChild} from "@angular/core";
import {AuthenticationService} from "../../model/network/authentication.service";
import {Router} from "@angular/router";
import {UserRoles} from "../../../../common/entities/UserDTO";
import {DatabaseSettingsService} from "./database.settings.service";
import {DataBaseConfig, DatabaseType} from "../../../../common/config/private/IPrivateConfig";
import {Utils} from "../../../../common/Utils";
import {Error} from "../../../../common/entities/Error";
import {NotificationService} from "../../model/notification.service";

@Component({
  selector: 'settings-database',
  templateUrl: './database.settings.component.html',
  styleUrls: ['./database.settings.component.css'],
  providers: [DatabaseSettingsService],
})
export class DatabaseSettingsComponent implements OnInit {
  @ViewChild('settingsForm') form;

  public settings: DataBaseConfig = <DataBaseConfig> {
    type: DatabaseType.memory,
    mysql: {}
  };
  private original: DataBaseConfig;
  public types: Array<any> = [];
  public DatabaseType: any;
  public tested = false;
  public error: string = null;
  public changed: boolean = false;

  constructor(private _authService: AuthenticationService,
              private _router: Router,
              private _dbSettings: DatabaseSettingsService,
              private notification: NotificationService) {
    this.original = Utils.clone(this.settings);
  }

  ngOnInit() {
    if (!this._authService.isAuthenticated() ||
      this._authService.user.value.role < UserRoles.Admin) {
      this._router.navigate(['login']);
      return;
    }
    this.types = Utils
      .enumToArray(DatabaseType);
    this.DatabaseType = DatabaseType;
    this.getSettings();

    this.form.valueChanges.subscribe((data) => {
      this.changed = !Utils.equalsFilter(this.settings, this.original);

      this.tested = false;
    });
  }

  private async getSettings() {
    const s = await this._dbSettings.getSettings();
    this.original = Utils.clone(s);
    this.settings = s;
    this.tested = false;
    this.changed = false;
  }

  public reset() {
    this.getSettings();
  }

  public async test() {
    try {
      await this._dbSettings.testSettings(this.settings);
      this.tested = true;
    } catch (err) {
      if (err.message)
        this.error = (<Error>err).message;
    }
  }

  public async save() {
    if (typeof this.settings.type == "undefined" || !this.tested) {
      return;
    }
    await this._dbSettings.updateSettings(this.settings);
    await this.getSettings();
    this.notification.success('Database settings saved', "Success");
  }

}



