import {AutoCompleteItem, SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {ISearchManager} from "../interfaces/ISearchManager";
import {SearchResultDTO} from "../../../common/entities/SearchResult";

export class SearchManager implements ISearchManager {
  autocomplete(text: string): Promise<AutoCompleteItem[]> {
    throw new Error("Method not implemented.");
  }

  search(text: string, searchType: SearchTypes): Promise<SearchResultDTO> {
    throw new Error("Method not implemented.");
  }

  instantSearch(text: string): Promise<SearchResultDTO> {
    throw new Error("Method not implemented.");
  }

  isSupported(): boolean {
    return false;
  }



}
