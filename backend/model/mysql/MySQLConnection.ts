import "reflect-metadata";
import {Connection, createConnection, getConnection} from "typeorm";
import {UserEntity} from "./enitites/UserEntity";
import {UserRoles} from "../../../common/entities/UserDTO";
import {PhotoEntity, PhotoMetadataEntity} from "./enitites/PhotoEntity";
import {DirectoryEntity} from "./enitites/DirectoryEntity";
import {Config} from "../../../common/config/private/Config";
import {SharingEntity} from "./enitites/SharingEntity";
import {DataBaseConfig} from "../../../common/config/private/IPrivateConfig";
import {PasswordHelper} from "../PasswordHelper";


export class MySQLConnection {

  constructor() {


  }

  private static connection: Connection = null;

  public static async getConnection(): Promise<Connection> {

    if (this.connection == null) {
      this.connection = await createConnection({
        name: "main",
        driver: {
          type: "mysql",
          host: Config.Server.database.mysql.host,
          port: 3306,
          username: Config.Server.database.mysql.username,
          password: Config.Server.database.mysql.password,
          database: Config.Server.database.mysql.database
        },
        entities: [
          UserEntity,
          DirectoryEntity,
          PhotoMetadataEntity,
          PhotoEntity,
          SharingEntity
        ],
        autoSchemaSync: true,
        logging: {
          logQueries: true,
          logOnlyFailedQueries: true,
          logFailedQueryError: true,
          logSchemaCreation: true
        }
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
      driver: {
        type: "mysql",
        host: config.mysql.host,
        port: 3306,
        username: config.mysql.username,
        password: config.mysql.password,
        database: config.mysql.database
      },
      entities: [
        UserEntity,
        DirectoryEntity,
        PhotoMetadataEntity,
        PhotoEntity,
        SharingEntity
      ],
      autoSchemaSync: true,
      logging: {
        logQueries: true,
        logOnlyFailedQueries: true,
        logFailedQueryError: true,
        logSchemaCreation: true
      }
    });
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
