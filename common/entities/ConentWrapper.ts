import {DirectoryDTO} from "./DirectoryDTO";
import {SearchResult} from "./SearchResult";
export class ContentWrapper {

    public directory: DirectoryDTO;
    public searchResult:SearchResult;

    constructor(directory: DirectoryDTO = null, searchResult: SearchResult = null) {
        this.directory = directory;
        this.searchResult = searchResult;
    }

}