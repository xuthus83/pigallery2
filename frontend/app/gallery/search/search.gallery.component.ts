///<reference path="../../../browser.d.ts"/>

import {Component} from "@angular/core";
import {AutoCompleteService} from "./autocomplete.service";
import {AutoCompleteItem} from "../../../../common/entities/AutoCompleteItem";
import {Message} from "../../../../common/entities/Message";
import {GalleryService} from "../gallery.service";
import {FORM_DIRECTIVES} from "@angular/common";

@Component({
    selector: 'gallery-search',
    templateUrl: 'app/gallery/search/search.gallery.component.html',
    styleUrls: ['app/gallery/search/search.gallery.component.css'],
    providers: [AutoCompleteService],
    directives: [FORM_DIRECTIVES]
})
export class GallerySearchComponent {

    autoCompleteItems:Array<AutoCompleteRenderItem> = [];
    private searchText:string = "";

    constructor(private _autoCompleteService:AutoCompleteService, private _galleryService:GalleryService) {
    }

    onSearchChange(event:KeyboardEvent) {
        let searchText = (<HTMLInputElement>event.target).value;
        if (searchText.trim().length > 0) {
            this._autoCompleteService.autoComplete(searchText).then((message:Message<Array<AutoCompleteItem>>) => {
                if (message.error) {
                    //TODO: implement
                    console.error(message.error);
                    return;
                }
                this.showSuggestions(message.result, searchText);
            });
        } else {
            this.emptyAutoComplete();
        }

        this._galleryService.instantSearch(searchText);
    }

    public onSearch() {
        this._galleryService.search(this.searchText);
    }
    
    private showSuggestions(suggestions:Array<AutoCompleteItem>, searchText:string) {
        this.emptyAutoComplete();
        suggestions.forEach((item)=> {
            let preIndex = item.text.toLowerCase().indexOf(searchText.toLowerCase());
            let renderItem = new AutoCompleteRenderItem();
            if (preIndex > -1) {
                renderItem.preText = item.text.substring(0, preIndex);
                renderItem.highLightText = item.text.substring(preIndex, preIndex + searchText.length);
                renderItem.postText = item.text.substring(preIndex + searchText.length);
            } else {
                renderItem.postText = item.text;
            }
            this.autoCompleteItems.push(renderItem);
        });
    }

    public onFocusLost(event) {
        this.autoCompleteItems = [];
    }

    private emptyAutoComplete() {
        this.autoCompleteItems = [];
    }


}

class AutoCompleteRenderItem {
    constructor(public preText:string = "", public  highLightText:string = "", public postText:string = "") {

    }
}

