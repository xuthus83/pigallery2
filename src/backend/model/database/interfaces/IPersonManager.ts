import {PersonEntry} from '../sql/enitites/PersonEntry';
import {PersonDTO} from '../../../../common/entities/PersonDTO';

export interface IPersonManager {
  getAll(): Promise<PersonEntry[]>;

  get(name: string): Promise<PersonEntry>;

  saveAll(names: string[]): Promise<void>;

  onGalleryIndexUpdate(): Promise<void>;

  updatePerson(name: string, partialPerson: PersonDTO): Promise<PersonEntry>;
}
