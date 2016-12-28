import {DirectoryDTO} from "./DirectoryDTO";
import {SearchResultDTO} from "./SearchResult";
export class ContentWrapper {

    public directory: DirectoryDTO;
    public searchResult: SearchResultDTO;

    constructor(directory: DirectoryDTO = null, searchResult: SearchResultDTO = null) {
        this.directory = directory;
        this.searchResult = searchResult;
    }

}