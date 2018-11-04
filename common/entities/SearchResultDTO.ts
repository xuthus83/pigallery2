import {DirectoryDTO} from './DirectoryDTO';
import {PhotoDTO} from './PhotoDTO';
import {SearchTypes} from './AutoCompleteItem';

export interface SearchResultDTO {
  searchText: string;
  searchType: SearchTypes;
  directories: Array<DirectoryDTO>;
  media: Array<PhotoDTO>;
  resultOverflow: boolean;
}
