import {SearchQueryDTO} from './SearchQueryDTO';
import {SortingMethods} from './SortingMethods';

export interface MediaPickDTO {
  searchQuery: SearchQueryDTO;
  sortBy: SortingMethods[];
  pick: number;
}
