///<reference path="../../../browser.d.ts"/>

import {Component} from "angular2/core";
import {AutoCompleteService} from "./autocomplete.service";

@Component({
    selector: 'gallery-search',
    templateUrl: 'app/gallery/search/search.gallery.component.html',
    styleUrls: ['app/gallery/search/search.gallery.component.css'],
    providers: [AutoCompleteService]
})
export class GallerySearchComponent {
 
    autoCompleteItems:Array<AutoCompleteItem> = [];
    constructor(private _autoCompleteService:AutoCompleteService) {
    }

    getSuggestions(event:KeyboardEvent){ 
        let searchText = (<HTMLInputElement>event.target).value;
        let result = [];
        if(searchText.length > 0) {
            result = this._autoCompleteService.autoComplete(searchText);
        }
        this.showSuggestions(result,searchText);
    }

    private showSuggestions(suggestions:Array<string>,searchText:string){
        this.autoCompleteItems = [];
        suggestions.forEach((value)=>{
            let preIndex = value.toLowerCase().indexOf(searchText.toLowerCase());
            let item = new AutoCompleteItem();
            if(preIndex > -1){
                item.preText = value.substring(0,preIndex);
                item.highLightText = value.substring(preIndex, preIndex + searchText.length);
                item.postText = value.substring(preIndex + searchText.length);                
            }else{
                item.postText = value;
            }
            this.autoCompleteItems.push(item);
        });
    }




}

class AutoCompleteItem{
    constructor(public preText:string = "",public  highLightText:string = "", public postText:string = ""){
        
    }
}

