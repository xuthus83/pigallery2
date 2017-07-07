import {AutoCompleteItem, SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {SearchResultDTO} from "../../../common/entities/SearchResult";
export interface ISearchManager {
    autocomplete(text: string, cb: (error: any, result: Array<AutoCompleteItem>) => void): void;
    search(text: string, searchType: SearchTypes, cb: (error: any, result: SearchResultDTO) => void): void;
    instantSearch(text: string, cb: (error: any, result: SearchResultDTO) => void): void;
  isSupported(): boolean;
}
