import {SQLConnection} from './SQLConnection';
import {PersonEntry} from './enitites/PersonEntry';
import {FaceRegionEntry} from './enitites/FaceRegionEntry';
import {PersonDTO} from '../../../../common/entities/PersonDTO';
import {ISQLPersonManager} from './IPersonManager';


export class PersonManager implements ISQLPersonManager {
  // samplePhotos: { [key: string]: PhotoDTO } = {};
  persons: PersonEntry[] = null;

  async updatePerson(name: string, partialPerson: PersonDTO): Promise<PersonEntry> {
    const connection = await SQLConnection.getConnection();
    const repository = connection.getRepository(PersonEntry);
    const person = await repository.createQueryBuilder('person')
      .limit(1)
      .where('person.name LIKE :name COLLATE utf8_general_ci', {name}).getOne();


    if (typeof partialPerson.name !== 'undefined') {
      person.name = partialPerson.name;
    }
    if (typeof partialPerson.isFavourite !== 'undefined') {
      person.isFavourite = partialPerson.isFavourite;
    }
    await repository.save(person);

    await this.loadAll();

    return person;
  }

  public async getAll(): Promise<PersonEntry[]> {
    if (this.persons === null) {
      await this.loadAll();
    }
    return this.persons;
  }

  /**
   * Used for statistic
   */
  public async countFaces(): Promise<number> {
    const connection = await SQLConnection.getConnection();
    return await connection.getRepository(FaceRegionEntry)
      .createQueryBuilder('faceRegion')
      .getCount();
  }

  public async get(name: string): Promise<PersonEntry> {
    if (this.persons === null) {
      await this.loadAll();
    }
    return this.persons.find((p): boolean => p.name === name);
  }

  public async saveAll(names: string[]): Promise<void> {
    const toSave: { name: string }[] = [];
    const connection = await SQLConnection.getConnection();
    const personRepository = connection.getRepository(PersonEntry);
    await this.loadAll();

    for (const item of names) {

      const person = this.persons.find((p): boolean => p.name === item);
      if (!person) {
        toSave.push({name: item});
      }
    }

    if (toSave.length > 0) {
      for (let i = 0; i < toSave.length / 200; i++) {
        await personRepository.insert(toSave.slice(i * 200, (i + 1) * 200));
      }
      await this.loadAll();
    }

  }

  public async onGalleryIndexUpdate(): Promise<void> {
    await this.updateCounts();
    await this.updateSamplePhotos();
    await this.loadAll();
  }

  private async loadAll(): Promise<void> {
    const connection = await SQLConnection.getConnection();
    const personRepository = connection.getRepository(PersonEntry);
    this.persons = await personRepository.find({
      relations: ['sampleRegion',
        'sampleRegion.media',
        'sampleRegion.media.directory']
    });
  }

  private async updateCounts(): Promise<void> {
    const connection = await SQLConnection.getConnection();
    await connection.query('UPDATE person_entry SET count = ' +
      ' (SELECT COUNT(1) FROM face_region_entry WHERE face_region_entry.personId = person_entry.id)');

    // remove persons without photo
    await connection
      .createQueryBuilder()
      .delete()
      .from(PersonEntry)
      .where('count = 0')
      .execute();
  }

  private async updateSamplePhotos(): Promise<void> {
    const connection = await SQLConnection.getConnection();
    await connection.query('update person_entry set sampleRegionId = ' +
      '(Select face_region_entry.id from  media_entity ' +
      'left join face_region_entry on media_entity.id = face_region_entry.mediaId ' +
      'where face_region_entry.personId=person_entry.id ' +
      'order by media_entity.metadataCreationdate desc ' +
      'limit 1)');

  }

}
