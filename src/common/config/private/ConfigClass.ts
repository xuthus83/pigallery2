import {IPrivateConfig, ServerConfig} from './IPrivateConfig';
import * as path from 'path';
import {ConfigLoader} from 'typeconfig';
import {Utils} from '../../Utils';
import {UserRoles} from '../../entities/UserDTO';
import {PrivateConfigDefaultsClass} from './PrivateConfigDefaultsClass';

declare var process: NodeJS.Process;

/**
 * This configuration will be only at backend
 */
export class ConfigClass extends PrivateConfigDefaultsClass implements IPrivateConfig {

  private static CONFIG_PATH = path.join(__dirname, './../../../../config.json');

  constructor() {
    super();

    // TODO: refactor this
    let configPath = process.argv.find(s => s.startsWith('--config-path='));
    if (configPath) {
      configPath = configPath.replace('--config-path=', '');
      if (path.isAbsolute(configPath)) {
        ConfigClass.CONFIG_PATH = configPath;
      } else {
        ConfigClass.CONFIG_PATH = path.join(__dirname, './../../../../', configPath);
      }
      console.log('using config path:' + ConfigClass.CONFIG_PATH);
    }
  }

  public setDatabaseType(type: ServerConfig.DatabaseType) {
    this.Server.Database.type = type;
    if (type === ServerConfig.DatabaseType.memory) {
      this.Client.Search.enabled = false;
      this.Client.Sharing.enabled = false;
    }
  }

  public load() {
    this.addComment();
    ConfigLoader.loadBackendConfig(this, ConfigClass.CONFIG_PATH,
      [['PORT', 'Server-port'],
        ['MYSQL_HOST', 'Server-Database-mysql-host'],
        ['MYSQL_PASSWORD', 'Server-Database-mysql-password'],
        ['MYSQL_USERNAME', 'Server-Database-mysql-username'],
        ['MYSQL_DATABASE', 'Server-Database-mysql-database']],
      process.argv.indexOf('--force-rewrite-config') !== -1);
    this.removeComment();

    if (process.argv.indexOf('--config-only') !== -1) {
      console.log('started with \'--config-only\' flag. Saving config and exiting.');
      process.exit();
    }

    if (Utils.enumToArray(UserRoles).map(r => r.key).indexOf(this.Client.unAuthenticatedUserRole) === -1) {
      throw new Error('Unknown user role for Client.unAuthenticatedUserRole, found: ' + this.Client.unAuthenticatedUserRole);
    }
    if (Utils.enumToArray(ServerConfig.LogLevel).map(r => r.key).indexOf(this.Server.Log.level) === -1) {
      throw new Error('Unknown Server.log.level, found: ' + this.Server.Log.level);
    }
    if (Utils.enumToArray(ServerConfig.SQLLogLevel).map(r => r.key).indexOf(this.Server.Log.sqlLevel) === -1) {
      throw new Error('Unknown Server.log.level, found: ' + this.Server.Log.sqlLevel);
    }

  }

  public save() {
    try {
      this.addComment();
      ConfigLoader.saveConfigFile(ConfigClass.CONFIG_PATH, this);
      this.removeComment();
    } catch (e) {
      throw new Error('Error during saving config: ' + e.toString());
    }
  }

  public original(): ConfigClass {
    const cfg = new ConfigClass();
    cfg.load();
    return cfg;
  }

  private addComment() {
    (<any>this)['__NOTE'] = 'NOTE: this config is not intended for manual edit, ' +
      'use the app UI instead as it has comments and descriptions.';
  }

  private removeComment() {
    delete (<any>this)['__NOTE'];
  }
}

