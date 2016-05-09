import {AutoCompleteItem} from "../../common/entities/AutoCompleteItem";
import {SearchResult} from "../../common/entities/SearchResult";
export interface ISearchManager {
    autocomplete(text, cb:(error:any, result:Array<AutoCompleteItem>) => void);
    search(text, cb:(error:any, result:SearchResult) => void);
    instantSearch(text, cb:(error:any, result:SearchResult) => void);
}