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
  styleUrls: ['./database.settings.component.css'],
  providers: [DatabaseSettingsService],
})
export class DatabaseSettingsComponent extends SettingsComponent<DataBaseConfig> {
  public settings: DataBaseConfig = <DataBaseConfig> {
    type: DatabaseType.memory,
    mysql: {}
  };
  public types: Array<any> = [];
  public DatabaseType: any;

  constructor(_authService: AuthenticationService,
              _navigation: NavigationService,
              _dbSettings: DatabaseSettingsService,
              notification: NotificationService) {
    super("Database", _authService, _navigation, _dbSettings, notification);
  }

  ngOnInit() {
    super.ngOnInit();
    this.types = Utils
      .enumToArray(DatabaseType);
    this.DatabaseType = DatabaseType;
  }


}



