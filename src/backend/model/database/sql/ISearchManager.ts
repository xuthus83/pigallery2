import {SearchQueryDTO, SearchQueryTypes} from '../../../../common/entities/SearchQueryDTO';
import {MediaDTO} from '../../../../common/entities/MediaDTO';
import {ISearchManager} from '../interfaces/ISearchManager';
import {AutoCompleteItem} from '../../../../common/entities/AutoCompleteItem';
import {SearchResultDTO} from '../../../../common/entities/SearchResultDTO';
import {PhotoDTO} from '../../../../common/entities/PhotoDTO';

export interface ISQLSearchManager extends ISearchManager {
  autocomplete(text: string, type: SearchQueryTypes): Promise<AutoCompleteItem[]>;

  search(query: SearchQueryDTO): Promise<SearchResultDTO>;

  getRandomPhoto(queryFilter: SearchQueryDTO): Promise<PhotoDTO>;

  // "Protected" functions. only called from other Managers, not from middlewares
  getPreview(query: SearchQueryDTO): Promise<MediaDTO>;
}
