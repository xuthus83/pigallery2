///<reference path="../../typings/main.d.ts"/>

import {AuthenticationMWs} from "../middlewares/AuthenticationMWs";
import {UserRoles} from "../../common/entities/User";

export class AdminRouter {
    constructor(private app) {

        this.addResetDB();
        this.addIndexGallery();
    }

    private addResetDB() {
        this.app.post("/api/admin/db/reset",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin)
            //TODO: implement
        );
    };

    private addIndexGallery() {
        this.app.post("/api/admin/gallery/index",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin)
            //TODO: implement
        );
    };


}