import { UserDTO, UserRoles } from '../../../../common/entities/UserDTO';
import { IUserManager } from '../interfaces/IUserManager';
import { UserEntity } from './enitites/UserEntity';
import { SQLConnection } from './SQLConnection';
import { PasswordHelper } from '../../PasswordHelper';
import { FindOptionsWhere } from 'typeorm';

export class UserManager implements IUserManager {
  constructor() {}

  public async findOne(filter: FindOptionsWhere<UserEntity>): Promise<any> {
    const connection = await SQLConnection.getConnection();
    const pass = filter.password as string;
    delete filter.password;
    const user = await connection.getRepository(UserEntity).findOneBy(filter);

    if (pass && !PasswordHelper.comparePassword(pass, user.password)) {
      throw new Error('No entry found');
    }
    return user;
  }

  public async find(filter: FindOptionsWhere<UserDTO>): Promise<any> {
    const connection = await SQLConnection.getConnection();
    return await connection.getRepository(UserEntity).findBy(filter);
  }

  public async createUser(user: UserDTO): Promise<any> {
    const connection = await SQLConnection.getConnection();
    user.password = PasswordHelper.cryptPassword(user.password);
    return connection.getRepository(UserEntity).save(user);
  }

  public async deleteUser(id: number): Promise<any> {
    const connection = await SQLConnection.getConnection();
    const user = await connection.getRepository(UserEntity).findOneBy({ id });
    return await connection.getRepository(UserEntity).remove(user);
  }

  public async changeRole(id: number, newRole: UserRoles): Promise<any> {
    const connection = await SQLConnection.getConnection();
    const userRepository = connection.getRepository(UserEntity);
    const user = await userRepository.findOneBy({ id });
    user.role = newRole;
    return userRepository.save(user);
  }

  public async changePassword(request: any): Promise<void> {
    throw new Error('not implemented'); // TODO: implement
  }
}
