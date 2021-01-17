import {AutoCompleteItem} from '../../../../common/entities/AutoCompleteItem';
import {ISearchManager} from '../interfaces/ISearchManager';
import {SearchResultDTO} from '../../../../common/entities/SearchResultDTO';
import {SearchQueryDTO, SearchQueryTypes} from '../../../../common/entities/SearchQueryDTO';

export class SearchManager implements ISearchManager {
  autocomplete(text: string, type: SearchQueryTypes): Promise<AutoCompleteItem[]> {
    throw new Error('Method not implemented.');
  }

  search(query: SearchQueryDTO): Promise<SearchResultDTO> {
    throw new Error('Method not implemented.');
  }
}
