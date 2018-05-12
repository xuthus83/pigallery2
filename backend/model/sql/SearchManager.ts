import {AutoCompleteItem, SearchTypes} from '../../../common/entities/AutoCompleteItem';
import {ISearchManager} from '../interfaces/ISearchManager';
import {SearchResultDTO} from '../../../common/entities/SearchResultDTO';
import {SQLConnection} from './SQLConnection';
import {PhotoEntity} from './enitites/PhotoEntity';
import {DirectoryEntity} from './enitites/DirectoryEntity';

export class SearchManager implements ISearchManager {

  private static autoCompleteItemsUnique(array: Array<AutoCompleteItem>): Array<AutoCompleteItem> {
    const a = array.concat();
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i].equals(a[j])) {
          a.splice(j--, 1);
        }
      }
    }

    return a;
  }

  async autocomplete(text: string): Promise<Array<AutoCompleteItem>> {

    const connection = await SQLConnection.getConnection();

    let result: Array<AutoCompleteItem> = [];
    const photoRepository = connection.getRepository(PhotoEntity);
    const directoryRepository = connection.getRepository(DirectoryEntity);


    (await photoRepository
      .createQueryBuilder('photo')
      .select('DISTINCT(photo.metadata.keywords)')
      .where('photo.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(5)
      .getRawMany())
      .map(r => <Array<string>>r.metadataKeywords.split(','))
      .forEach(keywords => {
        result = result.concat(this.encapsulateAutoComplete(keywords
          .filter(k => k.toLowerCase().indexOf(text.toLowerCase()) !== -1), SearchTypes.keyword));
      });


    (await photoRepository
      .createQueryBuilder('photo')
      .select('photo.metadata.positionData.country as country,' +
        ' photo.metadata.positionData.state as state, photo.metadata.positionData.city as city')
      .where('photo.metadata.positionData.country LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('photo.metadata.positionData.state LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('photo.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .groupBy('photo.metadata.positionData.country, photo.metadata.positionData.state, photo.metadata.positionData.city')
      .limit(5)
      .getRawMany())
      .filter(pm => !!pm)
      .map(pm => <Array<string>>[pm.city || '', pm.country || '', pm.state || ''])
      .forEach(positions => {
        result = result.concat(this.encapsulateAutoComplete(positions
          .filter(p => p.toLowerCase().indexOf(text.toLowerCase()) !== -1), SearchTypes.position));
      });

    result = result.concat(this.encapsulateAutoComplete((await photoRepository
      .createQueryBuilder('photo')
      .select('DISTINCT(photo.name)')
      .where('photo.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(5)
      .getRawMany())
      .map(r => r.name), SearchTypes.image));

    result = result.concat(this.encapsulateAutoComplete((await directoryRepository
      .createQueryBuilder('dir')
      .select('DISTINCT(dir.name)')
      .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(5)
      .getRawMany())
      .map(r => r.name), SearchTypes.directory));


    return SearchManager.autoCompleteItemsUnique(result);
  }

  async search(text: string, searchType: SearchTypes): Promise<SearchResultDTO> {
    const connection = await SQLConnection.getConnection();

    const result: SearchResultDTO = <SearchResultDTO>{
      searchText: text,
      searchType: searchType,
      directories: [],
      photos: [],
      resultOverflow: false
    };

    const query = connection
      .getRepository(PhotoEntity)
      .createQueryBuilder('photo')
      .innerJoinAndSelect('photo.directory', 'directory')
      .orderBy('photo.metadata.creationDate', 'ASC');


    if (!searchType || searchType === SearchTypes.directory) {
      query.orWhere('directory.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
    }

    if (!searchType || searchType === SearchTypes.image) {
      query.orWhere('photo.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
    }

    if (!searchType || searchType === SearchTypes.position) {
      query.orWhere('photo.metadata.positionData.country LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
        .orWhere('photo.metadata.positionData.state LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
        .orWhere('photo.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});

    }
    if (!searchType || searchType === SearchTypes.keyword) {
      query.orWhere('photo.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
    }

    result.photos = await query
      .limit(2001)
      .getMany();

    if (result.photos.length > 2000) {
      result.resultOverflow = true;
    }

    result.directories = await connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder('dir')
      .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(201)
      .getMany();

    if (result.directories.length > 200) {
      result.resultOverflow = true;
    }

    return result;
  }

  async instantSearch(text: string): Promise<SearchResultDTO> {
    const connection = await SQLConnection.getConnection();

    const result: SearchResultDTO = <SearchResultDTO>{
      searchText: text,
      // searchType:undefined, not adding this
      directories: [],
      photos: [],
      resultOverflow: false
    };

    result.photos = await connection
      .getRepository(PhotoEntity)
      .createQueryBuilder('photo')
      .orderBy('photo.metadata.creationDate', 'ASC')
      .where('photo.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('photo.metadata.positionData.country LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('photo.metadata.positionData.state LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('photo.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('photo.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .innerJoinAndSelect('photo.directory', 'directory')
      .limit(10)
      .getMany();


    result.directories = await connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder('dir')
      .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(10)
      .getMany();

    return result;
  }

  private encapsulateAutoComplete(values: Array<string>, type: SearchTypes): Array<AutoCompleteItem> {
    const res = [];
    values.forEach((value) => {
      res.push(new AutoCompleteItem(value, type));
    });
    return res;
  }
}
