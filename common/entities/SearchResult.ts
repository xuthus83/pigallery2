import {DirectoryDTO} from "./DirectoryDTO";
import {PhotoDTO} from "./PhotoDTO";
import {SearchTypes} from "./AutoCompleteItem";
export class SearchResult {
    public searchText:string = "";
    public searchType:SearchTypes;
    public directories: Array<DirectoryDTO> = [];
    public photos: Array<PhotoDTO> = [];
}