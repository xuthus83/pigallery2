///<reference path="../../browser.d.ts"/>

import {Component,  ViewEncapsulation} from 'angular2/core'; 
import {RouterLink} from "angular2/router";
 
@Component({
    selector: 'app-frame',
    templateUrl: 'app/frame/frame.component.html', 
    directives:[RouterLink], 
    encapsulation: ViewEncapsulation.Emulated
})
export class FrameComponent { 
    constructor() { 
    }
    

}

