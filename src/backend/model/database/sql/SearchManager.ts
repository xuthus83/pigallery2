import {AutoCompleteItem, SearchTypes} from '../../../../common/entities/AutoCompleteItem';
import {ISearchManager} from '../interfaces/ISearchManager';
import {SearchResultDTO} from '../../../../common/entities/SearchResultDTO';
import {SQLConnection} from './SQLConnection';
import {PhotoEntity} from './enitites/PhotoEntity';
import {DirectoryEntity} from './enitites/DirectoryEntity';
import {MediaEntity} from './enitites/MediaEntity';
import {VideoEntity} from './enitites/VideoEntity';
import {PersonEntry} from './enitites/PersonEntry';
import {FaceRegionEntry} from './enitites/FaceRegionEntry';
import {Brackets, SelectQueryBuilder, WhereExpression} from 'typeorm';
import {Config} from '../../../../common/config/private/Config';
import {
  ANDSearchQuery,
  DateSearch,
  DistanceSearch,
  OrientationSearch,
  OrientationSearchTypes,
  ORSearchQuery,
  RatingSearch,
  ResolutionSearch,
  SearchQueryDTO,
  SearchQueryTypes,
  TextSearch,
  TextSearchQueryTypes
} from '../../../../common/entities/SearchQueryDTO';
import {GalleryManager} from './GalleryManager';
import {ObjectManagers} from '../../ObjectManagers';

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

  async autocomplete(text: string): Promise<AutoCompleteItem[]> {

    const connection = await SQLConnection.getConnection();

    let result: AutoCompleteItem[] = [];
    const photoRepository = connection.getRepository(PhotoEntity);
    const videoRepository = connection.getRepository(VideoEntity);
    const personRepository = connection.getRepository(PersonEntry);
    const directoryRepository = connection.getRepository(DirectoryEntity);


    (await photoRepository
      .createQueryBuilder('photo')
      .select('DISTINCT(photo.metadata.keywords)')
      .where('photo.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(Config.Client.Search.AutoComplete.maxItemsPerCategory)
      .getRawMany())
      .map(r => <Array<string>>(<string>r.metadataKeywords).split(','))
      .forEach(keywords => {
        result = result.concat(this.encapsulateAutoComplete(keywords
          .filter(k => k.toLowerCase().indexOf(text.toLowerCase()) !== -1), SearchTypes.keyword));
      });

    result = result.concat(this.encapsulateAutoComplete((await personRepository
      .createQueryBuilder('person')
      .select('DISTINCT(person.name)')
      .where('person.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(Config.Client.Search.AutoComplete.maxItemsPerCategory)
      .orderBy('person.name')
      .getRawMany())
      .map(r => r.name), SearchTypes.person));

    (await photoRepository
      .createQueryBuilder('photo')
      .select('photo.metadata.positionData.country as country, ' +
        'photo.metadata.positionData.state as state, photo.metadata.positionData.city as city')
      .where('photo.metadata.positionData.country LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('photo.metadata.positionData.state LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .orWhere('photo.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .groupBy('photo.metadata.positionData.country, photo.metadata.positionData.state, photo.metadata.positionData.city')
      .limit(Config.Client.Search.AutoComplete.maxItemsPerCategory)
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
      .limit(Config.Client.Search.AutoComplete.maxItemsPerCategory)
      .getRawMany())
      .map(r => r.name), SearchTypes.photo));


    result = result.concat(this.encapsulateAutoComplete((await photoRepository
      .createQueryBuilder('media')
      .select('DISTINCT(media.metadata.caption) as caption')
      .where('media.metadata.caption LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(Config.Client.Search.AutoComplete.maxItemsPerCategory)
      .getRawMany())
      .map(r => r.caption), SearchTypes.photo));


    result = result.concat(this.encapsulateAutoComplete((await videoRepository
      .createQueryBuilder('media')
      .select('DISTINCT(media.name)')
      .where('media.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(Config.Client.Search.AutoComplete.maxItemsPerCategory)
      .getRawMany())
      .map(r => r.name), SearchTypes.video));

    result = result.concat(this.encapsulateAutoComplete((await directoryRepository
      .createQueryBuilder('dir')
      .select('DISTINCT(dir.name)')
      .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(Config.Client.Search.AutoComplete.maxItemsPerCategory)
      .getRawMany())
      .map(r => r.name), SearchTypes.directory));


    return SearchManager.autoCompleteItemsUnique(result);
  }

  async getGPSData(query: SearchQueryDTO) {
    if ((query as ANDSearchQuery | ORSearchQuery).list) {
      for (let i = 0; i < (query as ANDSearchQuery | ORSearchQuery).list.length; ++i) {
        (query as ANDSearchQuery | ORSearchQuery).list[i] =
          await this.getGPSData((query as ANDSearchQuery | ORSearchQuery).list[i]);
      }
    }
    if (query.type === SearchQueryTypes.distance && (<DistanceSearch>query).from.text) {
      (<DistanceSearch>query).from.GPSData =
        await ObjectManagers.getInstance().LocationManager.getGPSData((<DistanceSearch>query).from.text);
    }
    return query;
  }

  async aSearch(query: SearchQueryDTO) {
    query = this.flattenSameOfQueries(query);
    query = await this.getGPSData(query);
    const connection = await SQLConnection.getConnection();

    const result: SearchResultDTO = {
      searchText: null,
      searchType: null,
      directories: [],
      media: [],
      metaFile: [],
      resultOverflow: false
    };


    const sqlQuery = await connection.getRepository(MediaEntity).createQueryBuilder('media')
      .innerJoin(q => {
          const subQuery = q.from(MediaEntity, 'media')
            .select('distinct media.id')
            .limit(Config.Client.Search.maxMediaResult + 1);

          subQuery.leftJoin('media.directory', 'directory')
            .leftJoin('media.metadata.faces', 'faces')
            .leftJoin('faces.person', 'person')
            .where(this.buildWhereQuery(query));

          return subQuery;
        },
        'innerMedia',
        'media.id=innerMedia.id')
      .leftJoinAndSelect('media.directory', 'directory')
      .leftJoinAndSelect('media.metadata.faces', 'faces')
      .leftJoinAndSelect('faces.person', 'person');


    result.media = await this.loadMediaWithFaces(sqlQuery);

    if (result.media.length > Config.Client.Search.maxMediaResult) {
      result.resultOverflow = true;
    }

    /* result.directories = await connection
       .getRepository(DirectoryEntity)
       .createQueryBuilder('dir')
       .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
       .limit(Config.Client.Search.maxMediaResult + 1)
       .getMany();

    if (result.directories.length > Config.Client.Search.maxDirectoryResult) {
      result.resultOverflow = true;
    }*/

    return result;
  }

  async search(text: string, searchType: SearchTypes): Promise<SearchResultDTO> {
    const connection = await SQLConnection.getConnection();

    const result: SearchResultDTO = {
      searchText: text,
      searchType: searchType,
      directories: [],
      media: [],
      metaFile: [],
      resultOverflow: false
    };

    let usedEntity = MediaEntity;

    if (searchType === SearchTypes.photo) {
      usedEntity = PhotoEntity;
    } else if (searchType === SearchTypes.video) {
      usedEntity = VideoEntity;
    }

    const query = await connection.getRepository(usedEntity).createQueryBuilder('media')
      .innerJoin(q => {
          const subQuery = q.from(usedEntity, 'media')
            .select('distinct media.id')
            .limit(Config.Client.Search.maxMediaResult + 1);


          if (!searchType || searchType === SearchTypes.directory) {
            subQuery.leftJoin('media.directory', 'directory')
              .orWhere('directory.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
          }

          if (!searchType || searchType === SearchTypes.photo || searchType === SearchTypes.video) {
            subQuery.orWhere('media.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
          }

          if (!searchType || searchType === SearchTypes.photo) {
            subQuery.orWhere('media.metadata.caption LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
          }
          if (!searchType || searchType === SearchTypes.person) {
            subQuery
              .leftJoin('media.metadata.faces', 'faces')
              .leftJoin('faces.person', 'person')
              .orWhere('person.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
          }

          if (!searchType || searchType === SearchTypes.position) {
            subQuery.orWhere('media.metadata.positionData.country LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
              .orWhere('media.metadata.positionData.state LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
              .orWhere('media.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});

          }
          if (!searchType || searchType === SearchTypes.keyword) {
            subQuery.orWhere('media.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'});
          }

          return subQuery;
        },
        'innerMedia',
        'media.id=innerMedia.id')
      .leftJoinAndSelect('media.directory', 'directory')
      .leftJoinAndSelect('media.metadata.faces', 'faces')
      .leftJoinAndSelect('faces.person', 'person');


    result.media = await this.loadMediaWithFaces(query);

    if (result.media.length > Config.Client.Search.maxMediaResult) {
      result.resultOverflow = true;
    }

    result.directories = await connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder('dir')
      .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(Config.Client.Search.maxMediaResult + 1)
      .getMany();

    if (result.directories.length > Config.Client.Search.maxDirectoryResult) {
      result.resultOverflow = true;
    }

    return result;
  }

  async instantSearch(text: string): Promise<SearchResultDTO> {
    const connection = await SQLConnection.getConnection();

    const result: SearchResultDTO = {
      searchText: text,
      // searchType:undefined, not adding this
      directories: [],
      media: [],
      metaFile: [],
      resultOverflow: false
    };

    const query = await connection.getRepository(MediaEntity).createQueryBuilder('media')
      .innerJoin(q => q.from(MediaEntity, 'media')
          .select('distinct media.id')
          .limit(10)
          .leftJoin('media.directory', 'directory')
          .leftJoin('media.metadata.faces', 'faces')
          .leftJoin('faces.person', 'person')
          .where('media.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
          .orWhere('media.metadata.positionData.country LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
          .orWhere('media.metadata.positionData.state LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
          .orWhere('media.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
          .orWhere('media.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
          .orWhere('media.metadata.caption LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
          .orWhere('person.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
        ,
        'innerMedia',
        'media.id=innerMedia.id')
      .leftJoinAndSelect('media.directory', 'directory')
      .leftJoinAndSelect('media.metadata.faces', 'faces')
      .leftJoinAndSelect('faces.person', 'person');


    result.media = await this.loadMediaWithFaces(query);


    result.directories = await connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder('dir')
      .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: '%' + text + '%'})
      .limit(10)
      .getMany();

    return result;
  }

  private buildWhereQuery(query: SearchQueryDTO, paramCounter = {value: 0}): Brackets {
    switch (query.type) {
      case SearchQueryTypes.AND:
        return new Brackets(q => {
          (<ANDSearchQuery>query).list.forEach(sq => q.andWhere(this.buildWhereQuery(sq, paramCounter)));
          return q;
        });
      case SearchQueryTypes.OR:
        return new Brackets(q => {
          (<ANDSearchQuery>query).list.forEach(sq => q.orWhere(this.buildWhereQuery(sq, paramCounter)));
          return q;
        });


      case SearchQueryTypes.distance:
        /**
         * This is a best effort calculation, not fully accurate in order to have higher performance.
         * see: https://stackoverflow.com/a/50506609
         */
        const earth = 6378.137,  // radius of the earth in kilometer
          latDelta = (1 / ((2 * Math.PI / 360) * earth)),  // 1 km in degree
          lonDelta = (1 / ((2 * Math.PI / 360) * earth));  // 1 km in degree

        const minLat = (<DistanceSearch>query).from.GPSData.latitude - ((<DistanceSearch>query).distance * latDelta),
          maxLat = (<DistanceSearch>query).from.GPSData.latitude + ((<DistanceSearch>query).distance * latDelta),
          minLon = (<DistanceSearch>query).from.GPSData.latitude -
            ((<DistanceSearch>query).distance * lonDelta) / Math.cos(minLat * (Math.PI / 180)),
          maxLon = (<DistanceSearch>query).from.GPSData.latitude +
            ((<DistanceSearch>query).distance * lonDelta) / Math.cos(maxLat * (Math.PI / 180));

        return new Brackets(q => {
          const textParam: any = {};
          paramCounter.value++;
          textParam['maxLat' + paramCounter.value] = maxLat;
          textParam['minLat' + paramCounter.value] = minLat;
          textParam['maxLon' + paramCounter.value] = maxLon;
          textParam['minLon' + paramCounter.value] = minLon;
          q.where(`media.metadata.positionData.GPSData.latitude < :maxLat${paramCounter.value}`, textParam);
          q.andWhere(`media.metadata.positionData.GPSData.latitude > :minLat${paramCounter.value}`, textParam);
          q.andWhere(`media.metadata.positionData.GPSData.longitude < :maxLon${paramCounter.value}`, textParam);
          q.andWhere(`media.metadata.positionData.GPSData.longitude > :minLon${paramCounter.value}`, textParam);
          return q;
        });

      case SearchQueryTypes.date:
        return new Brackets(q => {
          if (typeof (<DateSearch>query).before === 'undefined' && typeof (<DateSearch>query).after === 'undefined') {
            throw new Error('Invalid search query: Date Query should contain before or after value');
          }
          if (typeof (<DateSearch>query).before !== 'undefined') {
            const textParam: any = {};
            textParam['before' + paramCounter.value] = (<DateSearch>query).before;
            q.where(`media.metadata.creationDate <= :before${paramCounter.value}`, textParam);
          }

          if (typeof (<DateSearch>query).after !== 'undefined') {
            const textParam: any = {};
            textParam['after' + paramCounter.value] = (<DateSearch>query).after;
            q.andWhere(`media.metadata.creationDate >= :after${paramCounter.value}`, textParam);
          }
          paramCounter.value++;
          return q;
        });

      case SearchQueryTypes.rating:
        return new Brackets(q => {
          if (typeof (<RatingSearch>query).min === 'undefined' && typeof (<RatingSearch>query).max === 'undefined') {
            throw new Error('Invalid search query: Rating Query should contain min or max value');
          }
          if (typeof (<RatingSearch>query).min !== 'undefined') {
            const textParam: any = {};
            textParam['min' + paramCounter.value] = (<RatingSearch>query).min;
            q.where(`media.metadata.rating >= :min${paramCounter.value}`, textParam);
          }

          if (typeof (<RatingSearch>query).max !== 'undefined') {
            const textParam: any = {};
            textParam['max' + paramCounter.value] = (<RatingSearch>query).max;
            q.andWhere(`media.metadata.rating <= :max${paramCounter.value}`, textParam);
          }
          paramCounter.value++;
          return q;
        });

      case SearchQueryTypes.resolution:
        return new Brackets(q => {
          if (typeof (<ResolutionSearch>query).min === 'undefined' && typeof (<ResolutionSearch>query).max === 'undefined') {
            throw new Error('Invalid search query: Rating Query should contain min or max value');
          }
          if (typeof (<ResolutionSearch>query).min !== 'undefined') {
            const textParam: any = {};
            textParam['min' + paramCounter.value] = (<RatingSearch>query).min * 1000 * 1000;
            q.where(`media.metadata.size.width * media.metadata.size.height >= :min${paramCounter.value}`, textParam);
          }

          if (typeof (<ResolutionSearch>query).max !== 'undefined') {
            const textParam: any = {};
            textParam['max' + paramCounter.value] = (<RatingSearch>query).max * 1000 * 1000;
            q.andWhere(`media.metadata.size.width * media.metadata.size.height <= :max${paramCounter.value}`, textParam);
          }
          paramCounter.value++;
          return q;
        });

      case SearchQueryTypes.orientation:
        return new Brackets(q => {
          if ((<OrientationSearch>query).orientation === OrientationSearchTypes.landscape) {
            q.where('media.metadata.size.width >= media.metadata.size.height');
          }
          if ((<OrientationSearch>query).orientation === OrientationSearchTypes.portrait) {
            q.andWhere('media.metadata.size.width <= media.metadata.size.height');
          }
          paramCounter.value++;
          return q;
        });


      case SearchQueryTypes.SOME_OF:
        throw new Error('Some of not supported');

    }

    return new Brackets((q: WhereExpression) => {

      const createMatchString = (str: string) => {
        return (<TextSearch>query).matchType === TextSearchQueryTypes.exact_match ? str : `%${str}%`;
      };

      const textParam: any = {};
      paramCounter.value++;
      textParam['text' + paramCounter.value] = createMatchString((<TextSearch>query).text);

      if (query.type === SearchQueryTypes.any_text ||
        query.type === SearchQueryTypes.directory) {
        const dirPathStr = ((<TextSearch>query).text).replace(new RegExp('\\\\', 'g'), '/');


        textParam['fullPath' + paramCounter.value] = createMatchString(dirPathStr);
        q.orWhere(`directory.path LIKE :fullPath${paramCounter.value} COLLATE utf8_general_ci`,
          textParam);

        const directoryPath = GalleryManager.parseRelativeDirePath(dirPathStr);
        q.orWhere(new Brackets(dq => {
          textParam['dirName' + paramCounter.value] = createMatchString(directoryPath.name);
          dq.where(`directory.name LIKE :dirName${paramCounter.value} COLLATE utf8_general_ci`,
            textParam);
          if (dirPathStr.includes('/')) {
            textParam['parentName' + paramCounter.value] = createMatchString(directoryPath.parent);
            dq.andWhere(`directory.path LIKE :parentName${paramCounter.value} COLLATE utf8_general_ci`,
              textParam);
          }
          return dq;
        }));
      }

      if (query.type === SearchQueryTypes.any_text || query.type === SearchQueryTypes.file_name) {
        q.orWhere(`media.name LIKE :text${paramCounter.value} COLLATE utf8_general_ci`,
          textParam);
      }

      if (query.type === SearchQueryTypes.any_text || query.type === SearchQueryTypes.caption) {
        q.orWhere(`media.metadata.caption LIKE :text${paramCounter.value} COLLATE utf8_general_ci`,
          textParam);
      }
      if (query.type === SearchQueryTypes.any_text || query.type === SearchQueryTypes.person) {
        q.orWhere(`person.name LIKE :text${paramCounter.value} COLLATE utf8_general_ci`,
          textParam);
      }

      if (query.type === SearchQueryTypes.any_text || query.type === SearchQueryTypes.position) {
        q.orWhere(`media.metadata.positionData.country LIKE :text${paramCounter.value} COLLATE utf8_general_ci`,
          textParam)
          .orWhere(`media.metadata.positionData.state LIKE :text${paramCounter.value} COLLATE utf8_general_ci`,
            textParam)
          .orWhere(`media.metadata.positionData.city LIKE :text${paramCounter.value} COLLATE utf8_general_ci`,
            textParam);
      }
      if (query.type === SearchQueryTypes.any_text || query.type === SearchQueryTypes.keyword) {
        q.orWhere(`media.metadata.keywords LIKE :text${paramCounter.value} COLLATE utf8_general_ci`,
          textParam);
      }
      return q;
    });
  }

  private flattenSameOfQueries(query: SearchQueryDTO): SearchQueryDTO {
    return query;
  }

  private encapsulateAutoComplete(values: string[], type: SearchTypes): Array<AutoCompleteItem> {
    const res: AutoCompleteItem[] = [];
    values.forEach((value) => {
      res.push(new AutoCompleteItem(value, type));
    });
    return res;
  }

  private async loadMediaWithFaces(query: SelectQueryBuilder<MediaEntity>) {
    const rawAndEntities = await query.orderBy('media.id').getRawAndEntities();
    const media: MediaEntity[] = rawAndEntities.entities;

    let rawIndex = 0;
    for (let i = 0; i < media.length; i++) {

      if (rawAndEntities.raw[rawIndex].media_id !== media[i].id) {
        throw new Error('index mismatch');
      }

      // media without a face
      if (rawAndEntities.raw[rawIndex].faces_id === null) {
        delete media[i].metadata.faces;
        rawIndex++;
        continue;
      }


      /*
            if (rawAndEntities.raw[rawIndex].faces_id === null ||
              rawAndEntities.raw[rawIndex].media_id !== media[i].id) {
              delete media[i].metadata.faces;
              continue;
            }*/

      // process all faces for one media
      media[i].metadata.faces = [];

      while (rawAndEntities.raw[rawIndex].media_id === media[i].id) {
        media[i].metadata.faces.push(<any>FaceRegionEntry.fromRawToDTO(rawAndEntities.raw[rawIndex]));
        rawIndex++;
        if (rawIndex >= rawAndEntities.raw.length) {
          return media;
        }
      }
    }
    return media;
  }
}
