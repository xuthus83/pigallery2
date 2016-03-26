///<reference path="../../../browser.d.ts"/>

import {Component, Input, OnInit} from 'angular2/core'; 
import {Directory} from "../../../../common/entities/Directory";
import {RouterLink} from "angular2/router";
import {Utils} from "../../../../common/Utils";

@Component({
    selector: 'gallery-directory',
    templateUrl: 'app/gallery/directory/directory.gallery.component.html',
    directives:[RouterLink]
})
export class GalleryDirectoryComponent{
    @Input() directory: Directory;
    
    constructor() {
    }

    getDirectoryPath(){
        return Utils.concatUrls(this.directory.path,this.directory.name);
    }

 
    
}

