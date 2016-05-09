import {AutoCompleteItem, AutoCompeleteTypes} from "../../../common/entities/AutoCompleteItem";
import {ISearchManager} from "../ISearchManager";
import {DirectoryModel} from "./entities/DirectoryModel";
import {PhotoModel} from "./entities/PhotoModel";
import {SearchResult} from "../../../common/entities/SearchResult";

export class MongoSearchManager implements ISearchManager {

    constructor() {
    }

    autocomplete(text, cb:(error:any, result:Array<AutoCompleteItem>) => void) {

        console.log("autocomplete: " + text);
        let items:Array<AutoCompleteItem> = [];
        PhotoModel.find({name: {$regex: text, $options: "i"}}).limit(10).select('name').exec((err, res:Array<any>) => {
            if (err || !res) {
                return cb(err, null);
            }
            items = items.concat(this.encapsulateAutoComplete(res.map(r => r.name), AutoCompeleteTypes.image));

            DirectoryModel.find({
                name: {
                    $regex: text,
                    $options: "i"
                }
            }).limit(10).select('name').exec((err, res:Array<any>) => {
                if (err || !res) {
                    return cb(err, null);
                }
                items = items.concat(this.encapsulateAutoComplete(res.map(r => r.name), AutoCompeleteTypes.directory));
                return cb(null, items);
            });


        });
    }

    search(text, cb:(error:any, result:SearchResult) => void) {
        console.log("instantSearch: " + text);
        let result:SearchResult = new SearchResult();
        result.searchText = text;
        PhotoModel.find({
            name: {
                $regex: text,
                $options: "i"
            }
        }).populate('directory', 'name path').exec((err, res:Array<any>) => {
            if (err || !res) {
                return cb(err, null);
            }
            result.photos = res;

            DirectoryModel.find({
                name: {
                    $regex: text,
                    $options: "i"
                }
            }).select('name').exec((err, res:Array<any>) => {
                if (err || !res) {
                    return cb(err, null);
                }
                result.directories = res;
                return cb(null, result);
            });


        });
    }

    instantSearch(text, cb:(error:any, result:SearchResult) => void) {
        console.log("instantSearch: " + text);
        let result:SearchResult = new SearchResult();
        result.searchText = text;
        PhotoModel.find({
            name: {
                $regex: text,
                $options: "i"
            }
        }).limit(10).populate('directory', 'name path').exec((err, res:Array<any>) => {
            if (err || !res) {
                return cb(err, null);
            }
            result.photos = res;

            DirectoryModel.find({
                name: {
                    $regex: text,
                    $options: "i"
                }
            }).limit(10).exec((err, res:Array<any>) => {
                if (err || !res) {
                    return cb(err, null);
                }
                result.directories = res;
                return cb(null, result);
            });


        });
    }

    private encapsulateAutoComplete(values:Array<string>, type:AutoCompeleteTypes) {
        let res = [];
        values.forEach((value)=> {
            res.push(new AutoCompleteItem(value, type));
        });
        return res;
    }


}