import {ISharingManager} from "../interfaces/ISharingManager";
import {SharingDTO} from "../../../common/entities/SharingDTO";

export class SharingManager implements ISharingManager {

  isSupported(): boolean {
    return false;
  }

  findOne(filter: any): Promise<SharingDTO> {
    throw new Error("not implemented");
  }

  createSharing(sharing: SharingDTO): Promise<SharingDTO> {
    throw new Error("not implemented");
  }

  updateSharing(sharing: SharingDTO): Promise<SharingDTO> {
    throw new Error("not implemented");
  }


}
