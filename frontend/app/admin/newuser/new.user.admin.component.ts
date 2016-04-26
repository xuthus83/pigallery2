
import {Component} from 'angular2/core';   
import {MATERIAL_DIRECTIVES} from "ng2-material/all"; 
import {MATERIAL_BROWSER_PROVIDERS} from "ng2-material/all";
 
@Component({
    selector: 'admin-new-user',
    templateUrl: 'app/admin/newuser/new.user.admin.component.html',
    styleUrls:['app/admin/newuser/new.user.admin.component.css'],
    directives:[MATERIAL_DIRECTIVES],
    providers:[MATERIAL_BROWSER_PROVIDERS]
})
export class NewUserComponent{
    constructor() {
    } 

}

