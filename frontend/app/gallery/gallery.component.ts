///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "../model/network/authentication.service.ts";
import {Router, RouteParams} from "@angular/router-deprecated";
import {GalleryService} from "./gallery.service";
import {GalleryDirectoryComponent} from "./directory/directory.gallery.component";
import {GalleryGridComponent} from "./grid/grid.gallery.component";
import {FrameComponent} from "../frame/frame.component";
import {GalleryLightboxComponent} from "./lightbox/lightbox.gallery.component";
import {GallerySearchComponent} from "./search/search.gallery.component";
import {Config} from "../config/Config";

@Component({
    selector: 'gallery',
    templateUrl: 'app/gallery/gallery.component.html',
    styleUrls: ['app/gallery/gallery.component.css'],
    directives: [GalleryGridComponent,
        GalleryDirectoryComponent,
        GalleryLightboxComponent,
        FrameComponent,
        GallerySearchComponent]
})
export class GalleryComponent implements OnInit {


    public showSearchBar:boolean = true;
    
    constructor(private _galleryService:GalleryService,
                private _params:RouteParams,
                private _authService:AuthenticationService,
                private _router:Router) {

        this.showSearchBar = Config.Client.Search.searchEnabled;
    }

    ngOnInit() {
        if (!this._authService.isAuthenticated()) {
            this._router.navigate(['Login']);
            return;
        }

        let directoryName = this._params.get('directory');
        console.log(this._params);
        console.log(directoryName);
        directoryName = directoryName ? directoryName : "";
        
        this._galleryService.getDirectory(directoryName);
    }


}

