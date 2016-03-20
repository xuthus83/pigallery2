///<reference path="../../../browser.d.ts"/>

import {Component, Input, OnInit} from 'angular2/core';
import {Photo} from "../../../../common/entities/Photo";

@Component({
    selector: 'gallery-photo',
    templateUrl: 'app/gallery/photo/photo.gallery.component.html'
})
export class GalleryPhotoComponent{
    @Input() photo: Photo;
    
    constructor() {
    }

    getPhotoPath(){
        return "/api/gallery/"+this.photo.name;
    }
    
}

