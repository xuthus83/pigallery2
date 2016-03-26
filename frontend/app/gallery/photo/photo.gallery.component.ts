///<reference path="../../../browser.d.ts"/>

import {Component, Input, OnInit} from 'angular2/core';
import {Photo} from "../../../../common/entities/Photo";
import {Directory} from "../../../../common/entities/Directory";
import {Utils} from "../../../../common/Utils"; 

@Component({
    selector: 'gallery-photo',
    templateUrl: 'app/gallery/photo/photo.gallery.component.html'
})
export class GalleryPhotoComponent{
    @Input() photo: Photo;
    @Input() directory: Directory;
    
    constructor() {
    }

    getPhotoPath(){
        console.log(Utils.concatUrls("/api/gallery",this.directory.path,this.directory.name,this.photo.name));
        return Utils.concatUrls("/api/gallery",this.directory.path,this.directory.name,this.photo.name); 
    }
    
}

