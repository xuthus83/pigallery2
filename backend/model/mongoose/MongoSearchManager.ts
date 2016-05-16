import {AutoCompleteItem, SearchTypes} from "../../../common/entities/AutoCompleteItem";
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
        let promises = [];

        promises.push(
            PhotoModel.find({name: {$regex: text, $options: "i"}})
                .limit(10).select('name').exec().then((res:Array<any>)=> {
                items = items.concat(this.encapsulateAutoComplete(res.map(r => r.name), SearchTypes.image));
            }));

        promises.push(
            PhotoModel.find({"metadata.positionData.city": {$regex: text, $options: "i"}})
                .limit(10).select('metadata.positionData.city').exec().then((res:Array<any>)=> {
                items = items.concat(this.encapsulateAutoComplete(res.map(r => r.metadata.positionData.city), SearchTypes.position));
            }));

        promises.push(
            PhotoModel.find({"metadata.positionData.state": {$regex: text, $options: "i"}})
                .limit(10).select('metadata.positionData.state').exec().then((res:Array<any>)=> {
                items = items.concat(this.encapsulateAutoComplete(res.map(r => r.metadata.positionData.state), SearchTypes.position));
            }));

        promises.push(
            PhotoModel.find({"metadata.positionData.country": {$regex: text, $options: "i"}})
                .limit(10).select('metadata.positionData.country').exec().then((res:Array<any>)=> {
                items = items.concat(this.encapsulateAutoComplete(res.map(r => r.metadata.positionData.country), SearchTypes.position));
            }));

        //TODO: fix caseinsensitivity
        promises.push(
            PhotoModel.find({"metadata.keywords": {$regex: text, $options: "i"}})
                .limit(10).select('metadata.keywords').exec().then((res:Array<any>)=> {
                res.forEach((photo)=> {
                    items = items.concat(this.encapsulateAutoComplete(photo.metadata.keywords.filter(k => k.indexOf(text) != -1), SearchTypes.keyword));
                });
            }));

        promises.push(
            DirectoryModel.find({
                name: {$regex: text, $options: "i"}
            }).limit(10).select('name').exec().then((res:Array<any>)=> {
                items = items.concat(this.encapsulateAutoComplete(res.map(r => r.name), SearchTypes.directory));
            }));


        Promise.all(promises).then(()=> {
            return cb(null, this.autoCompleteItemsUnique(items));
        }).catch((err)=> {
            console.error(err);
            return cb(err, null);
        });


    }

    search(text:string, searchType:SearchTypes, cb:(error:any, result:SearchResult) => void) {
        console.log("search: " + text + ", type:" + searchType);
        let result:SearchResult = new SearchResult();

        let promises = [];
        let photoFilterOR = [];

        result.searchText = text;
        result.searchType = searchType;


        if (!searchType || searchType === SearchTypes.image) {
            photoFilterOR.push({name: {$regex: text, $options: "i"}});
        }
        if (!searchType || searchType === SearchTypes.position) {
            photoFilterOR.push({"metadata.positionData.city": {$regex: text, $options: "i"}});
            photoFilterOR.push({"metadata.positionData.state": {$regex: text, $options: "i"}});
            photoFilterOR.push({"metadata.positionData.country": {$regex: text, $options: "i"}});
        }
        if (!searchType || searchType === SearchTypes.keyword) {
            photoFilterOR.push({"metadata.keywords": {$regex: text, $options: "i"}});
        }

        let photoFilter = {};
        if (photoFilterOR.length == 1) {
            photoFilter = photoFilterOR[0];
        } else {
            photoFilter = {$or: photoFilterOR};
        }

        if (!searchType || photoFilterOR.length > 0) {
            promises.push(PhotoModel.find(photoFilter).populate('directory', 'name path').exec().then((res:Array<any>) => {
                result.photos = res;
            }));
        }


        if (!searchType || searchType === SearchTypes.directory) {
            promises.push(DirectoryModel.find({
                name: {
                    $regex: text,
                    $options: "i"
                }
            }).exec().then((res:Array<any>) => {
                result.directories = res;
            }));
        }

        Promise.all(promises).then(()=> {
            return cb(null, result);
        }).catch((err)=> {
            console.error(err);
            return cb(err, null);
        });
    }

    instantSearch(text, cb:(error:any, result:SearchResult) => void) {
        console.log("instantSearch: " + text);
        let result:SearchResult = new SearchResult();
        result.searchText = text;
        PhotoModel.find({
            $or: [
                {name: {$regex: text, $options: "i"}},
                {"metadata.positionData.city": {$regex: text, $options: "i"}},
                {"metadata.positionData.state": {$regex: text, $options: "i"}},
                {"metadata.positionData.country": {$regex: text, $options: "i"}},
                {"metadata.keywords": {$regex: text, $options: "i"}}
            ]

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

    private encapsulateAutoComplete(values:Array<string>, type:SearchTypes) {
        let res = [];
        values.forEach((value)=> {
            res.push(new AutoCompleteItem(value, type));
        });
        return res;
    }

    private autoCompleteItemsUnique(array:Array<AutoCompleteItem>) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i].equals(a[j]))
                    a.splice(j--, 1);
            }
        }

        return a;
    }


}