import {Directory} from "./Directory";
import {Photo} from "./Photo";
import {SearchTypes} from "./AutoCompleteItem";
export class SearchResult {
    public searchText:string = "";
    public searchType:SearchTypes;
    public directories:Array<Directory> = [];
    public photos:Array<Photo> = [];
}