import {DirectoryDTO} from './DirectoryDTO';
import {SearchTypes} from './AutoCompleteItem';
import {FileDTO} from './FileDTO';
import {MediaDTO} from './MediaDTO';

export interface SearchResultDTO {
  searchText: string;
  searchType?: SearchTypes;
  directories: DirectoryDTO[];
  media: MediaDTO[];
  metaFile: FileDTO[];
  resultOverflow: boolean;
}
