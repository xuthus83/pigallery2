///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from 'angular2/core';
import {AuthenticationService} from "../model/authentication.service";
import {Router, Location, RouteParams} from "angular2/router";
import {GalleryService} from "./gallery.service";
import {Directory} from "../../../common/entities/Directory";
import {Message} from "../../../common/entities/Message";
import {GalleryPhotoComponent} from "./photo/photo.gallery.component";
import {GalleryDirectoryComponent} from "./directory/directory.gallery.component";

@Component({
    selector: 'gallery',
    templateUrl: 'app/gallery/gallery.component.html',
    directives:[GalleryPhotoComponent,
                GalleryDirectoryComponent]
})
export class GalleryComponent implements OnInit{

    currentDirectory:Directory = new Directory(-1,"","/",new Date(),[],[]);
    
    constructor(private _galleryService:GalleryService,
                private _params: RouteParams,
                private _authService: AuthenticationService,
                private _router: Router,
                private _location:Location) {
        
    }

    ngOnInit(){
        if (!this._authService.isAuthenticated()) {
            this._location.replaceState('/'); // clears browser history so they can't navigate with back button
            this._router.navigate(['Login']);
            return;
        }
        let directoryName = this._params.get('directory');
        directoryName = directoryName ? directoryName : "";
        this._galleryService.getDirectory(directoryName).then(( message:Message<Directory>) => {
            if(message.error){
                //TODO: implement
                return;
            }

            this.currentDirectory = message.result;
        });
    }
    
}

