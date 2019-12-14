import {UserDTO, UserRoles} from '../../../../common/entities/UserDTO';

export interface IUserManager {
  findOne(filter: any): Promise<UserDTO>;

  find(filter: any): Promise<UserDTO[]>;

  createUser(user: UserDTO): Promise<UserDTO>;

  deleteUser(id: number): Promise<UserDTO>;

  changeRole(id: number, newRole: UserRoles): Promise<UserDTO>;

  changePassword(request: any): Promise<void>;
}
