import {IPersonManager} from '../interfaces/IPersonManager';
import {PersonDTO} from '../../../../common/entities/PersonDTO';

export class PersonManager implements IPersonManager {

  getAll(): Promise<any[]> {
    throw new Error('not supported by memory DB');
  }

  get(name: string): Promise<any> {
    throw new Error('not supported by memory DB');
  }

  saveAll(names: string[]): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  onGalleryIndexUpdate(): Promise<void> {
    throw new Error('not supported by memory DB');
  }

  updatePerson(name: string, partialPerson: PersonDTO): Promise<any> {
    throw new Error('not supported by memory DB');
  }
}
