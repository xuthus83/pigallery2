import {AutoCompleteItem, SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {ISearchManager} from "../interfaces/ISearchManager";
import {SearchResultDTO} from "../../../common/entities/SearchResultDTO";
import {SQLConnection} from "./SQLConnection";
import {PhotoEntity} from "./enitites/PhotoEntity";
import {DirectoryEntity} from "./enitites/DirectoryEntity";
import {PositionMetaData} from "../../../common/entities/PhotoDTO";

export class SearchManager implements ISearchManager {

  async autocomplete(text: string) {

    const connection = await SQLConnection.getConnection();

    let result: Array<AutoCompleteItem> = [];
    let photoRepository = connection.getRepository(PhotoEntity);
    let directoryRepository = connection.getRepository(DirectoryEntity);


    (await photoRepository
      .createQueryBuilder('photo')
      .select('DISTINCT(photo.metadataKeywords)')
      .where('photo.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
      .setLimit(5)
      .getRawMany())
      .map(r => <Array<string>>JSON.parse(r.metadataKeywords))
      .forEach(keywords => {
        result = result.concat(this.encapsulateAutoComplete(keywords.filter(k => k.toLowerCase().indexOf(text.toLowerCase()) != -1), SearchTypes.keyword));
      });


    (await photoRepository
      .createQueryBuilder('photo')
      .select('DISTINCT(photo.metadataPositionData)')
      .where('photo.metadata.positionData LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
      .setLimit(5)
      .getRawMany())
      .map(r => <PositionMetaData>JSON.parse(r.metadataPositionData))
      .filter(pm => !!pm)
      .map(pm => <Array<string>>[pm.city || "", pm.country || "", pm.state || ""])
      .forEach(positions => {
        result = result.concat(this.encapsulateAutoComplete(positions.filter(p => p.toLowerCase().indexOf(text.toLowerCase()) != -1), SearchTypes.position));
      });


    result = result.concat(this.encapsulateAutoComplete((await photoRepository
      .createQueryBuilder('photo')
      .select('DISTINCT(photo.name)')
      .where('photo.name LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
      .setLimit(5)
      .getRawMany())
      .map(r => r.name), SearchTypes.image));

    result = result.concat(this.encapsulateAutoComplete((await directoryRepository
      .createQueryBuilder('dir')
      .select('DISTINCT(dir.name)')
      .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
      .setLimit(5)
      .getRawMany())
      .map(r => r.name), SearchTypes.directory));


    return this.autoCompleteItemsUnique(result);
  }

  async search(text: string, searchType: SearchTypes) {
    const connection = await SQLConnection.getConnection();

    let result: SearchResultDTO = <SearchResultDTO>{
      searchText: text,
      searchType: searchType,
      directories: [],
      photos: [],
      resultOverflow: false
    };

    let query = connection
      .getRepository(PhotoEntity)
      .createQueryBuilder("photo")
      .innerJoinAndSelect("photo.directory", "directory")
      .orderBy("photo.metadata.creationDate", "ASC");


    if (!searchType || searchType === SearchTypes.directory) {
      query.orWhere('directory.name LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"});
    }

    if (!searchType || searchType === SearchTypes.image) {
      query.orWhere('photo.name LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"});
    }

    if (!searchType || searchType === SearchTypes.position) {
      query.orWhere('photo.metadata.positionData LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"});
    }
    if (!searchType || searchType === SearchTypes.keyword) {
      query.orWhere('photo.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"});
    }
    let photos = await query
      .setLimit(2001)
      .getMany();


    if (photos) {
      for (let i = 0; i < photos.length; i++) {
        photos[i].metadata.keywords = <any>JSON.parse(<any>photos[i].metadata.keywords);
        photos[i].metadata.cameraData = <any>JSON.parse(<any>photos[i].metadata.cameraData);
        photos[i].metadata.positionData = <any>JSON.parse(<any>photos[i].metadata.positionData);
        photos[i].metadata.size = <any>JSON.parse(<any>photos[i].metadata.size);
      }
      result.photos = photos;
      if (result.photos.length > 2000) {
        result.resultOverflow = true;
      }
    }

    result.directories = await connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder("dir")
      .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
      .setLimit(201)
      .getMany();

    if (result.directories.length > 200) {
      result.resultOverflow = true;
    }

    return result;
  }

  async instantSearch(text: string) {
    const connection = await SQLConnection.getConnection();

    let result: SearchResultDTO = <SearchResultDTO>{
      searchText: text,
      directories: [],
      photos: [],
      resultOverflow: false
    };

    let photos = await connection
      .getRepository(PhotoEntity)
      .createQueryBuilder("photo")
      .orderBy("photo.metadata.creationDate", "ASC")
      .where('photo.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
      .orWhere('photo.metadata.positionData LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
      .orWhere('photo.name LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
      .innerJoinAndSelect("photo.directory", "directory")
      .setLimit(10)
      .getMany();


    if (photos) {
      for (let i = 0; i < photos.length; i++) {
        photos[i].metadata.keywords = <any>JSON.parse(<any>photos[i].metadata.keywords);
        photos[i].metadata.cameraData = <any>JSON.parse(<any>photos[i].metadata.cameraData);
        photos[i].metadata.positionData = <any>JSON.parse(<any>photos[i].metadata.positionData);
        photos[i].metadata.size = <any>JSON.parse(<any>photos[i].metadata.size);
      }
      result.photos = photos;
    }

    let directories = await connection
      .getRepository(DirectoryEntity)
      .createQueryBuilder("dir")
      .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
      .setLimit(10)
      .getMany();

    result.directories = directories;

    return result;
  }

  private encapsulateAutoComplete(values: Array<string>, type: SearchTypes) {
    let res = [];
    values.forEach((value) => {
      res.push(new AutoCompleteItem(value, type));
    });
    return res;
  }


  private autoCompleteItemsUnique(array: Array<AutoCompleteItem>) {
    let a = array.concat();
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (a[i].equals(a[j]))
          a.splice(j--, 1);
      }
    }

    return a;
  }
}
