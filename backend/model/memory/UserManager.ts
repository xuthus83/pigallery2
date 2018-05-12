import {UserDTO, UserRoles} from '../../../common/entities/UserDTO';
import {IUserManager} from '../interfaces/IUserManager';
import {ProjectPath} from '../../ProjectPath';
import {Utils} from '../../../common/Utils';
import * as path from 'path';
import * as fs from 'fs';
import {PasswordHelper} from '../PasswordHelper';


export class UserManager implements IUserManager {
  private db: { users?: UserDTO[], idCounter?: number } = {};
  private readonly dbPath;

  generateId(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return s4() + s4() + s4() + s4();
  }

  constructor() {
    this.dbPath = path.join(ProjectPath.Root, 'users.db');
    if (fs.existsSync(this.dbPath)) {
      this.loadDB();
    }

    if (!this.db.idCounter) {
      this.db.idCounter = 1;
    }

    if (!this.db.users) {
      this.db.users = [];
      // TODO: remove defaults
      this.createUser(<UserDTO>{name: 'admin', password: 'admin', role: UserRoles.Admin});
    }
    this.saveDB();

  }


  public async findOne(filter: any) {
    const result = await this.find(filter);

    if (result.length === 0) {
      throw new Error('UserDTO not found');
    }
    return result[0];
  }

  public async find(filter: any) {
    const pass = filter.password;
    delete filter.password;
    const users = this.db.users.slice();
    let i = users.length;
    while (i--) {
      if (pass && !(PasswordHelper.comparePassword(pass, users[i].password))) {
        users.splice(i, 1);
        continue;
      }
      if (Utils.equalsFilter(users[i], filter) === false) {
        users.splice(i, 1);
      }
    }
    return users;
  }

  public async createUser(user: UserDTO) {
    user.id = this.db.idCounter++;
    user.password = PasswordHelper.cryptPassword(user.password);
    this.db.users.push(user);
    this.saveDB();
    return user;
  }

  public async deleteUser(id: number) {
    const deleted = this.db.users.filter((u: UserDTO) => u.id === id);
    this.db.users = this.db.users.filter((u: UserDTO) => u.id !== id);
    this.saveDB();
    if (deleted.length > 0) {
      return deleted[0];
    }
    return null;
  }

  public async changeRole(id: number, newRole: UserRoles): Promise<UserDTO> {
    for (let i = 0; i < this.db.users.length; i++) {
      if (this.db.users[i].id === id) {
        this.db.users[i].role = newRole;
        this.saveDB();
        return this.db.users[i];
      }
    }
  }

  public async changePassword(request: any) {
    throw new Error('not implemented'); // TODO: implement
  }

  private loadDB() {
    const data = fs.readFileSync(this.dbPath, 'utf8');
    this.db = JSON.parse(data);
  }

  private saveDB() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.db));
  }

}
