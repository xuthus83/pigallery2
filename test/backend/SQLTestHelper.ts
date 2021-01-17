import {Config} from '../../src/common/config/private/Config';
import * as path from 'path';
import * as fs from 'fs';
import {SQLConnection} from '../../src/backend/model/database/sql/SQLConnection';
import {ServerConfig} from '../../src/common/config/private/PrivateConfig';
import {ProjectPath} from '../../src/backend/ProjectPath';
import {DirectoryDTO} from '../../src/common/entities/DirectoryDTO';
import {DirectoryEntity} from '../../src/backend/model/database/sql/enitites/DirectoryEntity';
import {ObjectManagers} from '../../src/backend/model/ObjectManagers';
import {DiskMangerWorker} from '../../src/backend/model/threading/DiskMangerWorker';
import {IndexingManager} from '../../src/backend/model/database/sql/IndexingManager';
import {GalleryManager} from '../../src/backend/model/database/sql/GalleryManager';
import {Connection} from 'typeorm';

declare let describe: any;
const savedDescribe = describe;

class IndexingManagerTest extends IndexingManager {

  public async saveToDB(scannedDirectory: DirectoryDTO): Promise<void> {
    return super.saveToDB(scannedDirectory);
  }
}

class GalleryManagerTest extends GalleryManager {

  public async selectParentDir(connection: Connection, directoryName: string, directoryParent: string): Promise<DirectoryEntity> {
    return super.selectParentDir(connection, directoryName, directoryParent);
  }

  public async fillParentDir(connection: Connection, dir: DirectoryEntity): Promise<void> {
    return super.fillParentDir(connection, dir);
  }
}

export class SQLTestHelper {

  static enable = {
    sqlite: true,
    mysql: process.env.TEST_MYSQL !== 'false'
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

  public static async persistTestDir(directory: DirectoryDTO): Promise<DirectoryEntity> {
    await ObjectManagers.InitSQLManagers();
    const connection = await SQLConnection.getConnection();
    ObjectManagers.getInstance().IndexingManager.indexDirectory = () => Promise.resolve(null);


    const im = new IndexingManagerTest();
    await im.saveToDB(directory);
    // not saving subdirs. saveToDB destroys data
    // await im.saveToDB(subDir);
    // await im.saveToDB(subDir2);

    if (ObjectManagers.getInstance().IndexingManager &&
      ObjectManagers.getInstance().IndexingManager.IsSavingInProgress) {
      await ObjectManagers.getInstance().IndexingManager.SavingReady;
    }

    const gm = new GalleryManagerTest();
    const dir = await gm.selectParentDir(connection, directory.name, path.join(path.dirname('.'), path.sep));
    await gm.fillParentDir(connection, dir);

    const populateDir = async (d: DirectoryDTO) => {
      for (let i = 0; i < d.directories.length; i++) {
        d.directories[i] = await gm.selectParentDir(connection, d.directories[i].name,
          path.join(DiskMangerWorker.pathFromParent(d), path.sep));
        await gm.fillParentDir(connection, <any>d.directories[i]);
        await populateDir(d.directories[i]);
      }
    };
    await populateDir(dir);

    await ObjectManagers.reset();
    return dir;
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
    ProjectPath.reset();
  }

  private async initMySQL() {
    Config.Server.Database.type = ServerConfig.DatabaseType.mysql;
    Config.Server.Database.mysql.database = 'pigallery2_test';

    await this.resetMySQL();
  }

  private async resetSQLite() {
    await SQLConnection.close();
    await fs.promises.rmdir(this.tempDir, {recursive: true});
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
