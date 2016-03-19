///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from 'angular2/core';
import {AuthenticationService} from "../model/authentication.service";
import {Router,Location} from "angular2/router";

@Component({
    selector: 'gallery',
    templateUrl: 'app/gallery/gallery.component.html'
})
export class GalleryComponent implements OnInit{

    constructor(private _authService: AuthenticationService, private _router: Router, private _location:Location) {
        
    }

    ngOnInit(){
        if (!this._authService.isAuthenticated()) {
            this._location.replaceState('/'); // clears browser history so they can't navigate with back button
            this._router.navigate(['Login']);
        }
    }
    
}

