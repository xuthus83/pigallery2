import "reflect-metadata";
import {createConnection, Connection} from "typeorm";
import {Config} from "../../config/Config";
import {UserEntity} from "./enitites/UserEntity";
import {UserRoles} from "../../../common/entities/UserDTO";
import {PhotoEntity, PhotoMetadataEntity} from "./enitites/PhotoEntity";
import {DirectoryEntity} from "./enitites/DirectoryEntity";


export class MySQLConnection {

    constructor() {


    }

    private static connection: Connection = null;

    public static getConnection(): Promise<Connection> {
        return new Promise<Connection>((resolve, reject) => {

            if (this.connection != null) {
                return resolve(this.connection);
            }

            createConnection({
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
                    PhotoEntity
                ],
                autoSchemaSync: true,
                logging: {
                    logQueries: true,
                    logOnlyFailedQueries: true,
                    logFailedQueryError: true,
                    logSchemaCreation: true
                }
            }).then((conn) => {
                this.connection = conn;
                return resolve(this.connection);

            }).catch(err => reject(err));
        });
    }

    public static init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getConnection().then(async connection => {

                let userRepository = connection.getRepository(UserEntity);
                let admins = await userRepository.find({role: UserRoles.Admin});
                if (admins.length == 0) {
                    let a = new UserEntity();
                    a.name = "admin";
                    a.password = "admin";
                    a.role = UserRoles.Admin;
                    await userRepository.persist(a);
                }

                resolve();
            }).catch(err => reject(err));
        });
    }


}