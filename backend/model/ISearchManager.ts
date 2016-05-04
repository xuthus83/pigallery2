import {AutoCompleteItem} from "../../common/entities/AutoCompleteItem";
export interface ISearchManager {
    autocomplete(text, cb:(error: any,result:Array<AutoCompleteItem>) => void);
}