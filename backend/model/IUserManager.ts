import {User, UserRoles} from "../../common/entities/User";
export interface IUserManager {
    findOne(filter: any, cb: (error: any, result: User) => void): void;
    find(filter: any, cb: (error: any, result: Array<User>) => void): void;
    createUser(user: User, cb: (error: any, result: User) => void): void;
    deleteUser(id: number, cb: (error: any, result: string) => void): void;
    changeRole(id: number, newRole: UserRoles, cb: (error: any) => void): void;
    changePassword(request: any, cb: (error: any, result: string) => void): void;
}