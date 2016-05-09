import {Directory} from "./Directory";
import {SearchResult} from "./SearchResult";
export class ContentWrapper {

    public directory:Directory;
    public searchResult:SearchResult;

    constructor(directory:Directory = null, searchResult:SearchResult = null) {
        this.directory = directory;
        this.searchResult = searchResult;
    }

}