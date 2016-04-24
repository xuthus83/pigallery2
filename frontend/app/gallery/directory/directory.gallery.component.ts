///<reference path="../../../browser.d.ts"/>

import {Component, Input, OnInit} from 'angular2/core'; 
import {Directory} from "../../../../common/entities/Directory";
import {RouterLink} from "angular2/router";
import {Utils} from "../../../../common/Utils";
import {MATERIAL_BROWSER_PROVIDERS} from "ng2-material/all";
import {ViewportHelper} from "ng2-material/all";
import {MATERIAL_DIRECTIVES} from "ng2-material/all";

@Component({
    selector: 'gallery-directory',
    templateUrl: 'app/gallery/directory/directory.gallery.component.html',
    directives:[RouterLink,MATERIAL_DIRECTIVES],
    providers:[MATERIAL_BROWSER_PROVIDERS, ViewportHelper]
})
export class GalleryDirectoryComponent{
    @Input() directory: Directory;
    
    constructor() {
    }

    getDirectoryPath(){
        return Utils.concatUrls(this.directory.path,this.directory.name);
    }

 
    
}

