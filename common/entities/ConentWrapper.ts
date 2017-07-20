import {DirectoryDTO} from "./DirectoryDTO";
import {SearchResultDTO} from "./SearchResultDTO";

export class ContentWrapper {
  constructor(public directory: DirectoryDTO = null,
              public searchResult: SearchResultDTO = null,
              public notModified?: boolean) {
  }
}
