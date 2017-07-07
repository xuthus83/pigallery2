import {AutoCompleteItem, SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {ISearchManager} from "../interfaces/ISearchManager";
import {SearchResultDTO} from "../../../common/entities/SearchResult";

export class SearchManager implements ISearchManager {

  isSupported(): boolean {
    return false;
  }

  autocomplete(text: string, cb: (error: any, result: Array<AutoCompleteItem>) => void) {
    throw new Error("not implemented");
  }

  search(text: string, searchType: SearchTypes, cb: (error: any, result: SearchResultDTO) => void) {
    throw new Error("not implemented");
  }

  instantSearch(text: string, cb: (error: any, result: SearchResultDTO) => void) {
    throw new Error("not implemented");
  }


}
