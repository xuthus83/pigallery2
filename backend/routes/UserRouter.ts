///<reference path="../../typings/main.d.ts"/>

import {UserMWs} from "../middlewares/UserMWs";
import {UserRoles} from "../../common/entities/User";
import {AuthenticationMWs} from "../middlewares/AuthenticationMWs";
import {UserRequestConstrainsMWs} from "../middlewares/UserRequestConstrainsMWs";

export class UserRouter{
    constructor(private app){
        this.addLogin();
        this.addGetSessionUser();
        this.addChangePassword();
        
        
        this.addCreateUser();
        this.addDeleteUser();
        this.addListUsers();
        this.addChangeRole();
    }

    private addLogin() {
        this.app.post("/api/user/login",
            AuthenticationMWs.inverseAuthenticate,
            AuthenticationMWs.login,
            AuthenticationMWs.renderUser
        );
    };

    private addGetSessionUser() {
        this.app.get("/api/user/login",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.renderUser
        );
    };


    private addChangePassword() {
        this.app.post("/api/user/:id/password",
            AuthenticationMWs.authenticate,
            UserRequestConstrainsMWs.forceSelfRequest,
            UserMWs.changePassword,
            UserMWs.renderOK
        );
    };


    private addCreateUser() {
        this.app.put("/api/user",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin),
            UserMWs.createUser,
            UserMWs.renderOK
        );
    };

    private addDeleteUser() {
        this.app.delete("/api/user/:id",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin),
            UserRequestConstrainsMWs.notSelfRequest,
            UserMWs.deleteUser,
            UserMWs.renderOK
        );
    };


    private addListUsers() {
        this.app.post("/api/user/list",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin),
            UserMWs.listUsers
        );
    };

    private addChangeRole() {
        this.app.post("/api/user/:id/role",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin),
            UserRequestConstrainsMWs.notSelfRequestOr2Admins,
            UserMWs.changeRole,
            UserMWs.renderOK
        );
    };


}