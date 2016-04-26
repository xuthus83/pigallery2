///<reference path="../../browser.d.ts"/>

import {Component, OnInit} from 'angular2/core'; 
import {AuthenticationService} from "../model/authentication.service";
import {Router} from "angular2/router";
import {MATERIAL_DIRECTIVES} from "ng2-material/all"; 
import {MATERIAL_BROWSER_PROVIDERS} from "ng2-material/all"; 
import {FrameComponent} from "../frame/frame.component";
 
@Component({
    selector: 'admin',
    templateUrl: 'app/admin/admin.component.html',
    styleUrls:['app/admin/admin.component.css'],
    directives:[MATERIAL_DIRECTIVES,  FrameComponent],
    providers:[MATERIAL_BROWSER_PROVIDERS]
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

