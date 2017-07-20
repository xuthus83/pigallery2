import "reflect-metadata";
import {Connection, createConnection, DriverOptions, getConnection} from "typeorm";
import {UserEntity} from "./enitites/UserEntity";
import {UserRoles} from "../../../common/entities/UserDTO";
import {PhotoEntity, PhotoMetadataEntity} from "./enitites/PhotoEntity";
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

      this.connection = await createConnection({
        name: "main",
        driver: this.getDriver(Config.Server.database),
        entities: [
          UserEntity,
          DirectoryEntity,
          PhotoMetadataEntity,
          PhotoEntity,
          SharingEntity
        ],
        autoSchemaSync: true,
        /*  logging: {
          logQueries: true,
          logOnlyFailedQueries: true,
          logFailedQueryError: true,
          logSchemaCreation: true
         }*/
      });
    }
    return this.connection;

  }

  public static async tryConnection(config: DataBaseConfig) {
    try {
      await getConnection("test").close();
    } catch (err) {
    }
    const conn = await createConnection({
      name: "test",
      driver: this.getDriver(config)
    });
    await conn.close();
    return true;
  }

  private static getDriver(config: DataBaseConfig): DriverOptions {
    let driver: DriverOptions = null;
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
        storage: ProjectPath.getAbsolutePath(config.sqlite.storage)
      };
    }
    return driver;
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
      await userRepository.persist(a);
    }

  }

  public static async close() {
    try {
      await getConnection().close();
    } catch (err) {
    }
  }


}
