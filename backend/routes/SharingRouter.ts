///<reference path="../../typings/main.d.ts"/>

import {AuthenticationMWs} from "../middlewares/AuthenticationMWs";
import {UserRoles} from "../../common/entities/User";

export class AdminRouter{
    constructor(private app) {

        this.addGetSharing();
        this.addUpdateSharing();
    }

    private addGetSharing() {
        this.app.get("/api/share/:directory",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.User)
            //TODO: implement
        );
    };

    private addUpdateSharing() {
        this.app.update("/api/share/:directory",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.User)
            //TODO: implement
        );
    };





}