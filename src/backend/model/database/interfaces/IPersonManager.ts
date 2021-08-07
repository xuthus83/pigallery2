import {PersonEntry} from '../sql/enitites/PersonEntry';
import {PersonDTO} from '../../../../common/entities/PersonDTO';
import {IObjectManager} from './IObjectManager';

export interface IPersonManager extends IObjectManager {
  getAll(): Promise<PersonEntry[]>;

  get(name: string): Promise<PersonEntry>;

  saveAll(names: string[]): Promise<void>;

  updatePerson(name: string, partialPerson: PersonDTO): Promise<PersonEntry>;
}
