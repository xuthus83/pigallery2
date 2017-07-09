import {ISharingManager} from "../interfaces/ISharingManager";
import {SharingDTO} from "../../../common/entities/SharingDTO";
import {MySQLConnection} from "./MySQLConnection";
import {SharingEntity} from "./enitites/SharingEntity";
import {Config} from "../../../common/config/private/Config";
import {PasswordHelper} from "../PasswordHelper";

export class SharingManager implements ISharingManager {

  isSupported(): boolean {
    return true;
  }

  private async removeExpiredLink() {
    const connection = await MySQLConnection.getConnection();
    return connection
      .getRepository(SharingEntity)
      .createQueryBuilder("share")
      .where("expires < :now", {now: Date.now()})
      .delete()
      .execute();
  }

  async findOne(filter: any): Promise<SharingDTO> {
    await this.removeExpiredLink();
    const connection = await MySQLConnection.getConnection();
    return await connection.getRepository(SharingEntity).findOne(filter);
  }

  async createSharing(sharing: SharingDTO): Promise<SharingDTO> {
    await this.removeExpiredLink();
    const connection = await MySQLConnection.getConnection();
    if (sharing.password) {
      sharing.password = await PasswordHelper.cryptPassword(sharing.password);
    }
    return await connection.getRepository(SharingEntity).persist(sharing);


  }

  async updateSharing(inSharing: SharingDTO): Promise<SharingDTO> {
    const connection = await MySQLConnection.getConnection();

    let sharing = await connection.getRepository(SharingEntity).findOne({
      id: inSharing.id,
      creator: inSharing.creator.id,
      path: inSharing.path
    });

    if (sharing.timeStamp < Date.now() - Config.Server.sharing.updateTimeout) {
      throw "Sharing is locked, can't update anymore"
    }

    sharing.password = inSharing.password;
    sharing.includeSubfolders = inSharing.includeSubfolders;
    sharing.expires = inSharing.expires;

    return await connection.getRepository(SharingEntity).persist(sharing);
  }


}
