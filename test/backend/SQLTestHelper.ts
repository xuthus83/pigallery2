import {Config} from '../../src/common/config/private/Config';
import * as path from 'path';
import * as util from 'util';
import * as rimraf from 'rimraf';
import {SQLConnection} from '../../src/backend/model/database/sql/SQLConnection';
import {ServerConfig} from '../../src/common/config/private/PrivateConfig';

declare let describe: any;
const savedDescribe = describe;
const rimrafPR = util.promisify(rimraf);

export class SQLTestHelper {

  static enable = {
    sqlite: true,
    mysql: true
  };
  public static readonly savedDescribe = savedDescribe;
  tempDir: string;

  constructor(public dbType: ServerConfig.DatabaseType) {
    this.tempDir = path.join(__dirname, './tmp');
  }

  static describe(name: string, tests: (helper?: SQLTestHelper) => void) {
    savedDescribe(name, async () => {
      if (SQLTestHelper.enable.sqlite) {
        const helper = new SQLTestHelper(ServerConfig.DatabaseType.sqlite);
        savedDescribe('sqlite', () => {
          return tests(helper);
        });
      }
      if (SQLTestHelper.enable.mysql) {
        const helper = new SQLTestHelper(ServerConfig.DatabaseType.mysql);
        savedDescribe('mysql', function () {
          this.timeout(99999999);
          // @ts-ignore
          return tests(helper);
        });
      }
    });
  }

  public async initDB() {
    if (this.dbType === ServerConfig.DatabaseType.sqlite) {
      await this.initSQLite();
    } else {
      await this.initMySQL();
    }
  }


  public async clearDB() {
    if (this.dbType === ServerConfig.DatabaseType.sqlite) {
      await this.clearUpSQLite();
    } else {
      await this.clearUpMysql();
    }
  }

  private async initSQLite() {
    await this.resetSQLite();

    Config.Server.Database.type = ServerConfig.DatabaseType.sqlite;
    Config.Server.Database.dbFolder = this.tempDir;
  }

  private async initMySQL() {
    Config.Server.Database.type = ServerConfig.DatabaseType.mysql;
    Config.Server.Database.mysql.database = 'pigallery2_test';

    await this.resetMySQL();
  }

  private async resetSQLite() {
    await SQLConnection.close();
    await rimrafPR(this.tempDir);
  }

  private async resetMySQL() {
    Config.Server.Database.type = ServerConfig.DatabaseType.mysql;
    Config.Server.Database.mysql.database = 'pigallery2_test';
    const conn = await SQLConnection.getConnection();
    await conn.query('DROP DATABASE IF EXISTS ' + conn.options.database);
    await conn.query('CREATE DATABASE IF NOT EXISTS ' + conn.options.database);
    await SQLConnection.close();
  }

  private async clearUpMysql() {
    Config.Server.Database.type = ServerConfig.DatabaseType.mysql;
    Config.Server.Database.mysql.database = 'pigallery2_test';
    const conn = await SQLConnection.getConnection();
    await conn.query('DROP DATABASE IF EXISTS ' + conn.options.database);
    await SQLConnection.close();
  }

  private async clearUpSQLite() {
    return this.resetSQLite();
  }
}
