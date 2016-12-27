import {UserMWs} from "../middlewares/user/UserMWs";
import {UserRoles} from "../../common/entities/UserDTO";
import {AuthenticationMWs} from "../middlewares/user/AuthenticationMWs";
import {UserRequestConstrainsMWs} from "../middlewares/user/UserRequestConstrainsMWs";
import {RenderingMWs} from "../middlewares/RenderingMWs";

export class UserRouter {
    constructor(private app) {
        this.addLogin();
        this.addLogout();
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
            RenderingMWs.renderSessionUser
        );
    };

    private addLogout() {
        this.app.post("/api/user/logout",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.logout,
            RenderingMWs.renderOK
        );
    };


    private addGetSessionUser() {
        this.app.get("/api/user/login",
            AuthenticationMWs.authenticate,
            RenderingMWs.renderSessionUser
        );
    };


    private addChangePassword() {
        this.app.post("/api/user/:id/password",
            AuthenticationMWs.authenticate,
            UserRequestConstrainsMWs.forceSelfRequest,
            UserMWs.changePassword,
            RenderingMWs.renderOK
        );
    };


    private addCreateUser() {
        this.app.put("/api/user",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin),
            UserMWs.createUser,
            RenderingMWs.renderOK
        );
    };

    private addDeleteUser() {
        this.app.delete("/api/user/:id",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin),
            UserRequestConstrainsMWs.notSelfRequest,
            UserMWs.deleteUser,
            RenderingMWs.renderOK
        );
    };


    private addListUsers() {
        this.app.get("/api/user/list",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin),
            UserMWs.listUsers,
            RenderingMWs.renderResult
        );
    };

    private addChangeRole() {
        this.app.post("/api/user/:id/role",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin),
            UserRequestConstrainsMWs.notSelfRequestOr2Admins,
            UserMWs.changeRole,
            RenderingMWs.renderOK
        );
    };


}