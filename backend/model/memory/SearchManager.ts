import {AutoCompleteItem} from "../../../common/entities/AutoCompleteItem";
import {ISearchManager} from "../ISearchManager";

export class SearchManager implements ISearchManager{


    autocomplete(text, cb:(error: any,result:Array<AutoCompleteItem>) => void){
        throw new Error("not implemented");
    }



}