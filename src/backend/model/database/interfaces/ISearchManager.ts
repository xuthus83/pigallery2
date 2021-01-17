import {AutoCompleteItem} from '../../../../common/entities/AutoCompleteItem';
import {SearchResultDTO} from '../../../../common/entities/SearchResultDTO';
import {SearchQueryDTO, SearchQueryTypes} from '../../../../common/entities/SearchQueryDTO';

export interface ISearchManager {
  autocomplete(text: string): Promise<AutoCompleteItem[]>;

  search(query: SearchQueryDTO): Promise<SearchResultDTO>;

  instantSearch(text: string): Promise<SearchResultDTO>;
}
