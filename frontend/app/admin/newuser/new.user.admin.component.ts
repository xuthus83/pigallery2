
import {Component} from 'angular2/core';   
import {MATERIAL_DIRECTIVES} from "ng2-material/all";
import {MdDialogRef} from "ng2-material/components/dialog/dialog_ref";
 
@Component({
    selector: 'admin-new-user',
    templateUrl: 'app/admin/newuser/new.user.admin.component.html',
    styleUrls:['app/admin/newuser/new.user.admin.component.css'],
    directives:[MATERIAL_DIRECTIVES]
})
export class NewUserComponent{
    constructor(private dialog: MdDialogRef) {
    } 

}

