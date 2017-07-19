import {DirectoryDTO, NotModifiedDirectoryDTO} from "./DirectoryDTO";
import {SearchResultDTO} from "./SearchResult";

export class ContentWrapper {

  public directory: DirectoryDTO | NotModifiedDirectoryDTO;
  public searchResult: SearchResultDTO;

  constructor(directory: DirectoryDTO | NotModifiedDirectoryDTO = null, searchResult: SearchResultDTO = null) {
    this.directory = directory;
    this.searchResult = searchResult;
  }

}
