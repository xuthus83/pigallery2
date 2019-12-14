import {AutoCompleteItem, SearchTypes} from '../../../../common/entities/AutoCompleteItem';
import {SearchResultDTO} from '../../../../common/entities/SearchResultDTO';

export interface ISearchManager {
  autocomplete(text: string): Promise<AutoCompleteItem[]>;

  search(text: string, searchType: SearchTypes): Promise<SearchResultDTO>;

  instantSearch(text: string): Promise<SearchResultDTO>;
}
