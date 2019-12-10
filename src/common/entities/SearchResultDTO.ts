import {DirectoryDTO} from './DirectoryDTO';
import {PhotoDTO} from './PhotoDTO';
import {SearchTypes} from './AutoCompleteItem';
import {FileDTO} from './FileDTO';

export interface SearchResultDTO {
  searchText: string;
  searchType?: SearchTypes;
  directories: DirectoryDTO[];
  media: PhotoDTO[];
  metaFile: FileDTO[];
  resultOverflow: boolean;
}
