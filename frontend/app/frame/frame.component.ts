///<reference path="../../browser.d.ts"/>

import {Component,  ViewEncapsulation} from '@angular/core'; 
import {RouterLink} from "@angular/router-deprecated";
 
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

