import {AutoCompleteItem, SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {SearchResult} from "../../../common/entities/SearchResult";
export interface ISearchManager {
    autocomplete(text: string, cb: (error: any, result: Array<AutoCompleteItem>) => void): void;
    search(text: string, searchType: SearchTypes, cb: (error: any, result: SearchResult) => void): void;
    instantSearch(text: string, cb: (error: any, result: SearchResult) => void): void;
}