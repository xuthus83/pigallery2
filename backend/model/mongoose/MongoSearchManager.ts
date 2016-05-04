import {AutoCompleteItem, AutoCompeleteTypes} from "../../../common/entities/AutoCompleteItem";
import {ISearchManager} from "../ISearchManager";
import {DirectoryModel} from "./entities/DirectoryModel";
import {PhotoModel} from "./entities/PhotoModel";

export class MongoSearchManager implements ISearchManager{


    constructor(){
    }


    autocomplete(text, cb:(error: any,result:Array<AutoCompleteItem>) => void){

        console.log("autocomplete: " + text);
        let items:Array<AutoCompleteItem> = [];
        PhotoModel.find({name:  { $regex: text, $options: "i" } }).limit(10).select('name').exec( (err,res) =>{
            if(err || !res){
                return cb(err,null);
            }
            items = items.concat(this.encapsulateAutoComplete(res.map(r => r.name),AutoCompeleteTypes.image));

            DirectoryModel.find({name:  { $regex: text, $options: "i" } }).limit(10).select('name').exec( (err,res) =>{
                if(err || !res){
                    return cb(err,null);
                }
                items = items.concat(this.encapsulateAutoComplete(res.map(r => r.name),AutoCompeleteTypes.directory));
                return cb(null,items);
            });


        });
    }

    private encapsulateAutoComplete(values:Array<string>,type: AutoCompeleteTypes){
        let res = [];
        values.forEach((value)=>{
            res.push(new AutoCompleteItem(value,type));
        });
        return res;
    }



}