import "reflect-metadata";
import {Connection, ConnectionOptions, createConnection, getConnection} from "typeorm";
import {UserEntity} from "./enitites/UserEntity";
import {UserRoles} from "../../../common/entities/UserDTO";
import {PhotoEntity} from "./enitites/PhotoEntity";
import {DirectoryEntity} from "./enitites/DirectoryEntity";
import {Config} from "../../../common/config/private/Config";
import {SharingEntity} from "./enitites/SharingEntity";
import {DataBaseConfig, DatabaseType} from "../../../common/config/private/IPrivateConfig";
import {PasswordHelper} from "../PasswordHelper";
import {ProjectPath} from "../../ProjectPath";


export class SQLConnection {

  constructor() {


  }

  private static connection: Connection = null;

  public static async getConnection(): Promise<Connection> {

    if (this.connection == null) {

      let options: any = this.getDriver(Config.Server.database);
      options.name = "main";
      options.entities = [
        UserEntity,
        PhotoEntity,
        DirectoryEntity,
        SharingEntity
      ];
      options.synchronize = true;
      options.logging = "all";
      this.connection = await createConnection(options);
    }
    return this.connection;

  }

  public static async tryConnection(config: DataBaseConfig) {
    try {
      await getConnection("test").close();
    } catch (err) {
    }
    const options: any = this.getDriver(config);
    options.name = "test";
    options.entities = [
      UserEntity,
      PhotoEntity,
      DirectoryEntity,
      SharingEntity
    ];
    options.synchronize = true;
    //options.logging = "all";
    const conn = await createConnection(options);
    await conn.close();
    return true;
  }

  public static async init(): Promise<void> {
    const connection = await this.getConnection();
    let userRepository = connection.getRepository(UserEntity);
    let admins = await userRepository.find({role: UserRoles.Admin});
    if (admins.length == 0) {
      let a = new UserEntity();
      a.name = "admin";
      a.password = PasswordHelper.cryptPassword("admin");
      a.role = UserRoles.Admin;
      await userRepository.save(a);
    }

  }

  private static getDriver(config: DataBaseConfig): ConnectionOptions {
    let driver: ConnectionOptions = null;
    if (config.type == DatabaseType.mysql) {
      driver = {
        type: "mysql",
        host: config.mysql.host,
        port: 3306,
        username: config.mysql.username,
        password: config.mysql.password,
        database: config.mysql.database
      };
    } else if (config.type == DatabaseType.sqlite) {
      driver = {
        type: "sqlite",
        database: ProjectPath.getAbsolutePath(config.sqlite.storage)
      };
    }
    return driver;
  }

  public static async close() {
    try {
      if (this.connection != null) {
        await this.connection.close();
        this.connection = null;
      }
    } catch (err) {
      console.error(err);
    }
  }


}
