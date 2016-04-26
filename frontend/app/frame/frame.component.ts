///<reference path="../../browser.d.ts"/>

import {Component,  ViewEncapsulation} from 'angular2/core'; 
import {Router, RouterLink} from "angular2/router";
import {MATERIAL_DIRECTIVES} from "ng2-material/all"; 
import {MATERIAL_BROWSER_PROVIDERS} from "ng2-material/all";
import {ViewportHelper} from "ng2-material/all";
import {SidenavService} from "ng2-material/all";
 
@Component({
    selector: 'app-frame',
    templateUrl: 'app/frame/frame.component.html', 
    directives:[RouterLink,MATERIAL_DIRECTIVES], 
    providers: [SidenavService],
    encapsulation: ViewEncapsulation.Emulated
})
export class FrameComponent { 
    constructor( private _router: Router, public sidenav: SidenavService) { 
    }
    
    public showSideNav(){
        this.sidenav.show("menu");
    }   
}

