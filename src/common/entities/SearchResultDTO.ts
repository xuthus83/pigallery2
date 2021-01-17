import {DirectoryDTO} from './DirectoryDTO';
import {FileDTO} from './FileDTO';
import {MediaDTO} from './MediaDTO';
import {SearchQueryDTO} from './SearchQueryDTO';

export interface SearchResultDTO {
  searchQuery: SearchQueryDTO;
  directories: DirectoryDTO[];
  media: MediaDTO[];
  metaFile: FileDTO[];
  resultOverflow: boolean;
}
