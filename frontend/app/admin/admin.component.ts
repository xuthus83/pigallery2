///<reference path="../../browser.d.ts"/>

import {Component, OnInit, Pipe, PipeTransform} from "angular2/core";
import {AuthenticationService} from "../model/network/authentication.service.ts";
import {Router} from "angular2/router";
import {FrameComponent} from "../frame/frame.component";
import {User, UserRoles} from "../../../common/entities/User";
import {FORM_DIRECTIVES} from "angular2/common";
import {Utils} from "../../../common/Utils";
import {AdminService} from "./admin.service";
import {Message} from "../../../common/entities/Message";
import {StringifyRole} from "./StringifyRolePipe"; 

@Component({
    selector: 'admin',
    templateUrl: 'app/admin/admin.component.html',
    styleUrls: ['app/admin/admin.component.css'],
    directives: [FrameComponent, FORM_DIRECTIVES],
    providers: [AdminService],
    pipes: [StringifyRole]
})
export class AdminComponent implements OnInit {

    private newUser = new User();
    private userRoles:Array<any> = [];
    private users:Array<User> = [];

    constructor(private _authService:AuthenticationService, private _router:Router, private _adminService:AdminService) {
    }

    ngOnInit() {
        if (!this._authService.isAuthenticated() || this._authService.getUser().role < UserRoles.Admin) {
            this._router.navigate(['Login']);
            return;
        }
        this.userRoles = Utils.enumToArray(UserRoles).filter(r => r.key <= this._authService.getUser().role);
        this.getUsersList();
    }
    
    private getUsersList(){
        this._adminService.getUsers().then((result:Message<Array<User>>) =>{
            this.users = result.result;
        });
    }

    
    canModifyUser(user:User):boolean{
        let currentUser =  this._authService.getUser();
        if(!currentUser){
            return false;
        }
        
        return currentUser.name != user.name && currentUser.role >= user.role;
    }
    
    initNewUser() { 
        this.newUser = new User();
        this.newUser.role = UserRoles.User; 
    }

    addNewUser(){
        this._adminService.createUser(this.newUser).then(() =>{
            this.getUsersList();
        });
    }

    updateRole(user:User){
        this._adminService.updateRole(user).then(() =>{
            this.getUsersList();
        });
    }
    
    deleteUser(user:User){
        this._adminService.deleteUser(user).then(() =>{
            this.getUsersList();
        });   
    }
}



