///<reference path="../../../browser.d.ts"/>

import {Component} from "@angular/core";
import {AutoCompleteService} from "./autocomplete.service";
import {AutoCompleteItem} from "../../../../common/entities/AutoCompleteItem";
import {Message} from "../../../../common/entities/Message";

@Component({
    selector: 'gallery-search',
    templateUrl: 'app/gallery/search/search.gallery.component.html',
    styleUrls: ['app/gallery/search/search.gallery.component.css'],
    providers: [AutoCompleteService]
})
export class GallerySearchComponent {
 
    autoCompleteItems:Array<AutoCompleteRenderItem> = [];
    constructor(private _autoCompleteService:AutoCompleteService) {
    }

    getSuggestions(event:KeyboardEvent){ 
        let searchText = (<HTMLInputElement>event.target).value; 
        if(searchText.trim().length > 0) {
            this._autoCompleteService.autoComplete(searchText).then((message:Message<Array<AutoCompleteItem>>) =>{
                if(message.error){
                    //TODO: implement
                    console.error(message.error);
                    return;
                }
                this.showSuggestions(message.result,searchText);
            });
        }else{
            this.emptyAutoComplete();            
        }
    }

    private showSuggestions(suggestions:Array<AutoCompleteItem>,searchText:string){
        this.emptyAutoComplete();
        suggestions.forEach((item)=>{
            let preIndex = item.text.toLowerCase().indexOf(searchText.toLowerCase());
            let renderItem = new AutoCompleteRenderItem();
            if(preIndex > -1){
                renderItem.preText = item.text.substring(0,preIndex);
                renderItem.highLightText = item.text.substring(preIndex, preIndex + searchText.length);
                renderItem.postText = item.text.substring(preIndex + searchText.length);                
            }else{
                renderItem.postText = item.text;
            }
            this.autoCompleteItems.push(renderItem);
        });
    }
    
    public onFocusLost(event){
        this.autoCompleteItems = [];
    }
    
    private emptyAutoComplete(){
        this.autoCompleteItems = [];        
    }




}

class AutoCompleteRenderItem{
    constructor(public preText:string = "",public  highLightText:string = "", public postText:string = ""){
        
    }
}

