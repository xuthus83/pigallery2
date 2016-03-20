///<reference path="../../../browser.d.ts"/>

import {Component, Input, OnInit} from 'angular2/core'; 
import {Directory} from "../../../../common/entities/Directory";

@Component({
    selector: 'gallery-directory',
    templateUrl: 'app/gallery/directory/directory.gallery.component.html'
})
export class GalleryDirectoryComponent{
    @Input() directory: Directory;
    
    constructor() {
    }

 
    
}

