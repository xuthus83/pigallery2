///<reference path="../../browser.d.ts"/>

import {Component, OnInit, ViewChild} from "@angular/core";
import {AuthenticationService} from "../model/network/authentication.service.ts";
import {Router, RouteParams} from "@angular/router-deprecated";
import {GalleryService} from "./gallery.service";
import {GalleryDirectoryComponent} from "./directory/directory.gallery.component";
import {GalleryGridComponent} from "./grid/grid.gallery.component";
import {FrameComponent} from "../frame/frame.component";
import {GalleryLightboxComponent} from "./lightbox/lightbox.gallery.component";
import {GallerySearchComponent} from "./search/search.gallery.component";
import {Config} from "../config/Config";
import {SearchTypes} from "../../../common/entities/AutoCompleteItem";

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

    @ViewChild(GallerySearchComponent) search:GallerySearchComponent;

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


        let searchText = this._params.get('searchText');
        if (searchText && searchText != "") {
            console.log("searching");
            let typeString = this._params.get('type');

            if (typeString && typeString != "") {
                console.log("with type");
                let type:SearchTypes = SearchTypes[typeString];
                this._galleryService.search(searchText, type);
                return;
            }

            this._galleryService.search(searchText);
            return;
        }


        let directoryName = this._params.get('directory');
        directoryName = directoryName ? directoryName : "";

        this._galleryService.getDirectory(directoryName);


    }


}

