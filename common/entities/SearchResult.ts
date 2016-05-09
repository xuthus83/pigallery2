import {Directory} from "./Directory";
import {Photo} from "./Photo";
export class SearchResult {

    public directories:Array<Directory>;
    public photos:Array<Photo>;

    constructor(directories:Array<Directory>, photos:Array<Photo>) {
        this.directories = directories;
        this.photos = photos;
    }
}