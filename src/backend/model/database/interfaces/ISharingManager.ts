import {SharingDTO} from '../../../../common/entities/SharingDTO';

export interface ISharingManager {
  findOne(filter: any): Promise<SharingDTO>;

  createSharing(sharing: SharingDTO): Promise<SharingDTO>;

  updateSharing(sharing: SharingDTO): Promise<SharingDTO>;
}
