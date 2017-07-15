import {Component} from "@angular/core";
import {AuthenticationService} from "../../model/network/authentication.service";
import {DataBaseConfig, DatabaseType} from "../../../../common/config/private/IPrivateConfig";
import {Utils} from "../../../../common/Utils";
import {NotificationService} from "../../model/notification.service";
import {NavigationService} from "../../model/navigation.service";
import {SettingsComponent} from "../_abstract/abstract.settings.component";
import {DatabaseSettingsService} from "./database.settings.service";

@Component({
  selector: 'settings-database',
  templateUrl: './database.settings.component.html',
  styleUrls: ['./database.settings.component.css',
    './../_abstract/abstract.settings.component.css'],
  providers: [DatabaseSettingsService],
})
export class DatabaseSettingsComponent extends SettingsComponent<DataBaseConfig> {

  public types: Array<any> = [];
  public DatabaseType: any;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _settingsService: DatabaseSettingsService,
              notification: NotificationService) {
    super("Database", _authService, _navigation, _settingsService, notification, s => s.Server.database);
  }

  ngOnInit() {
    super.ngOnInit();
    this.types = Utils
      .enumToArray(DatabaseType);
    this.DatabaseType = DatabaseType;
  }


}



