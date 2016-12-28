import {AutoCompleteItem, SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {ISearchManager} from "../interfaces/ISearchManager";
import {SearchResultDTO} from "../../../common/entities/SearchResult";
import {MySQLConnection} from "./MySQLConnection";
import {PhotoEntity} from "./enitites/PhotoEntity";
import {DirectoryEnitity} from "./enitites/DirectoryEntity";
import {PositionMetaData} from "../../../common/entities/PhotoDTO";

export class SearchManager implements ISearchManager {


    autocomplete(text: string, cb: (error: any, result: Array<AutoCompleteItem>) => void) {

        MySQLConnection.getConnection().then(async connection => {
            try {
                let result: Array<AutoCompleteItem> = [];
                let photoRepository = connection.getRepository(PhotoEntity);
                let directoryRepository = connection.getRepository(DirectoryEnitity);


                (await photoRepository
                    .createQueryBuilder('photo')
                    .select('DISTINCT(photo.metadataKeywords)')
                    .where('photo.metadata.keywords LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
                    .setLimit(5)
                    .getRawMany<{metadataKeywords: string}>())
                    .map(r => <Array<string>>JSON.parse(r.metadataKeywords))
                    .forEach(keywords => {
                        result = result.concat(this.encapsulateAutoComplete(keywords.filter(k => k.toLowerCase().indexOf(text.toLowerCase()) != -1), SearchTypes.keyword));
                    });


                (await photoRepository
                    .createQueryBuilder('photo')
                    .select('DISTINCT(photo.metadataPositionData)')
                    .where('photo.metadata.positionData LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
                    .setLimit(5)
                    .getRawMany<{metadataPositionData: string}>())
                    .map(r => <PositionMetaData>JSON.parse(r.metadataPositionData))
                    .map(pm => <Array<string>>[pm.city || "", pm.country || "", pm.state || ""])
                    .forEach(positions => {
                        result = result.concat(this.encapsulateAutoComplete(positions.filter(p => p.toLowerCase().indexOf(text.toLowerCase()) != -1), SearchTypes.position));
                    });


                result = result.concat(this.encapsulateAutoComplete((await photoRepository
                    .createQueryBuilder('photo')
                    .select('DISTINCT(photo.name)')
                    .where('photo.name LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
                    .setLimit(5)
                    .getRawMany<{name: string}>())
                    .map(r => r.name), SearchTypes.image));

                result = result.concat(this.encapsulateAutoComplete((await directoryRepository
                    .createQueryBuilder('dir')
                    .select('DISTINCT(dir.name)')
                    .where('dir.name LIKE :text COLLATE utf8_general_ci', {text: "%" + text + "%"})
                    .setLimit(5)
                    .getRawMany<{name: string}>())
                    .map(r => r.name), SearchTypes.directory));


                return cb(null, this.autoCompleteItemsUnique(result));
            } catch (error) {
                return cb(error, null);
            }

        }).catch((error) => {
            return cb(error, null);
        });
    }

    search(text: string, searchType: SearchTypes, cb: (error: any, result: SearchResultDTO) => void) {
        throw new Error("not implemented");
    }

    instantSearch(text: string, cb: (error: any, result: SearchResultDTO) => void) {
        throw new Error("not implemented");
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