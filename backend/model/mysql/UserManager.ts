import {UserDTO, UserRoles} from "../../../common/entities/UserDTO";
import {IUserManager} from "../interfaces/IUserManager";
import {UserEntity} from "./enitites/UserEntity";
import {MySQLConnection} from "./MySQLConnection";

export class UserManager implements IUserManager {

    constructor() {
    }


    public findOne(filter: any, cb: (error: any, result: UserDTO) => void) {
        MySQLConnection.getConnection().then(async connection => {

            let userRepository = connection.getRepository(UserEntity);
            return cb(null, await userRepository.findOne(filter));

        }).catch((error) => {
            return cb(error, null);
        });

    }

    public find(filter: any, cb: (error: any, result: Array<UserDTO>) => void) {
        MySQLConnection.getConnection().then(async connection => {

            let userRepository = connection.getRepository(UserEntity);
            return cb(null, await userRepository.find(filter));

        }).catch((error) => {
            return cb(error, null);
        });
    }

    public createUser(user: UserDTO, cb: (error: any, result: UserDTO) => void = (e, r) => {
    }) {
        MySQLConnection.getConnection().then(connection => {

            let userRepository = connection.getRepository(UserEntity);
            userRepository.persist(user).then(u => cb(null, u)).catch(err => cb(err, null));

        }).catch((error) => {
            return cb(error, null);
        });
    }

    public deleteUser(id: number, cb: (error: any) => void) {
        MySQLConnection.getConnection().then(connection => {


            let userRepository = connection.getRepository(UserEntity);
            userRepository.findOne({id: id}).then((user) => {
                userRepository.remove(user).catch(err => cb(err));
            }).catch(err => cb(err));


        }).catch((error) => {
            return cb(error);
        });
    }

    public changeRole(id: number, newRole: UserRoles, cb: (error: any, result: string) => void) {

        MySQLConnection.getConnection().then(async connection => {


            let userRepository = connection.getRepository(UserEntity);
            let user = await userRepository.findOne({id: id});
            user.role = newRole;
            await userRepository.persist(user);
            return cb(null, "ok");


        }).catch((error) => {
            return cb(error, null);
        });
    }

    public changePassword(request: any, cb: (error: any, result: string) => void) {
        throw new Error("not implemented"); //TODO: implement
    }

}