import {SharingDTO} from '../../../../common/entities/SharingDTO';

export interface ISharingManager {
  findOne(filter: any): Promise<SharingDTO>;

  createSharing(sharing: SharingDTO): Promise<SharingDTO>;

  updateSharing(sharing: SharingDTO, forceUpdate: boolean): Promise<SharingDTO>;

  find(filter: any): Promise<SharingDTO[]>;

  deleteSharing(sharingKey: string): Promise<void>;
}
