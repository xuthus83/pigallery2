///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from 'angular2/core'; 
import {AuthenticationService} from "../model/network/authentication.service.ts";
import {Router} from "angular2/router";
import {FrameComponent} from "../frame/frame.component";
 
@Component({
    selector: 'admin',
    templateUrl: 'app/admin/admin.component.html',
    styleUrls:['app/admin/admin.component.css'],
    directives:[FrameComponent]
})
export class AdminComponent implements OnInit{
    constructor(private _authService: AuthenticationService, private _router: Router) {
    }

    ngOnInit(){
        if (!this._authService.isAuthenticated()) {
            this._router.navigate(['Login']);
            return;
        }
    }


}

