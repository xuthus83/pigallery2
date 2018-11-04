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
      .createQueryBuilder('media')
      .select('DISTINCT(media.metadata.keywords)')
      .where('media.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(5)
      .getRawMany())
      .map(r => <Array<string>>r.metadataKeywords.split(','))
      .forEach(keywords => {
        result = result.concat(this.encapsulateAutoComplete(keywords
          .filter(k => k.toLowerCase().indexOf(text.toLowerCase()) !== -1), SearchTypes.keyword));
      });


    (await photoRepository
      .createQueryBuilder('media')
      .select('media.metadata.positionData.country as country,' +
        'mediao.metadata.positionData.state as state, media.metadata.positionData.city as city')
      .where('media.metadata.positionData.country LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('media.metadata.positionData.state LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('media.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .groupBy('media.metadata.positionData.country, media.metadata.positionData.state, media.metadata.positionData.city')
      .limit(5)
      .getRawMany())
      .filter(pm => !!pm)
      .map(pm => <Array<string>>[pm.city || '', pm.country || '', pm.state || ''])
      .forEach(positions => {
        result = result.concat(this.encapsulateAutoComplete(positions
          .filter(p => p.toLowerCase().indexOf(text.toLowerCase()) !== -1), SearchTypes.position));
      });

    result = result.concat(this.encapsulateAutoComplete((await photoRepository
      .createQueryBuilder('media')
      .select('DISTINCT(media.name)')
      .where('media.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
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
      media: [],
      resultOverflow: false
    };

    const query = connection
      .getRepository(PhotoEntity)
      .createQueryBuilder('media')
      .innerJoinAndSelect('media.directory', 'directory')
      .orderBy('media.metadata.creationDate', 'ASC');


    if (!searchType || searchType === SearchTypes.directory) {
      query.orWhere('directory.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
    }

    if (!searchType || searchType === SearchTypes.image) {
      query.orWhere('media.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
    }

    if (!searchType || searchType === SearchTypes.position) {
      query.orWhere('media.metadata.positionData.country LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
        .orWhere('media.metadata.positionData.state LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
        .orWhere('media.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});

    }
    if (!searchType || searchType === SearchTypes.keyword) {
      query.orWhere('media.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
    }

    result.media = await query
      .limit(2001)
      .getMany();

    if (result.media.length > 2000) {
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
      media: [],
      resultOverflow: false
    };

    result.media = await connection
      .getRepository(PhotoEntity)
      .createQueryBuilder('media')
      .orderBy('media.metadata.creationDate', 'ASC')
      .where('media.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('media.metadata.positionData.country LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('media.metadata.positionData.state LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('media.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('media.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .innerJoinAndSelect('media.directory', 'directory')
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
