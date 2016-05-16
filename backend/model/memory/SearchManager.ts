import {AutoCompleteItem, SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {ISearchManager} from "../ISearchManager";
import {SearchResult} from "../../../common/entities/SearchResult";

export class SearchManager implements ISearchManager {


    autocomplete(text, cb:(error:any, result:Array<AutoCompleteItem>) => void) {
        throw new Error("not implemented");
    }

    search(text, searchType:SearchTypes, cb:(error:any, result:SearchResult) => void) {
        throw new Error("not implemented");
    }

    instantSearch(text, cb:(error:any, result:SearchResult) => void) {
        throw new Error("not implemented");
    }


}