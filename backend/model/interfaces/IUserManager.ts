import {UserDTO, UserRoles} from "../../../common/entities/UserDTO";
export interface IUserManager {
    findOne(filter: any, cb: (error: any, result: UserDTO) => void): void;
    find(filter: any, cb: (error: any, result: Array<UserDTO>) => void): void;
    createUser(user: UserDTO, cb: (error: any, result: UserDTO) => void): void;
    deleteUser(id: number, cb: (error: any, result: string) => void): void;
    changeRole(id: number, newRole: UserRoles, cb: (error: any) => void): void;
    changePassword(request: any, cb: (error: any, result: string) => void): void;
}