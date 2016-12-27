import {AuthenticationMWs} from "../middlewares/user/AuthenticationMWs";
import {UserRoles} from "../../common/entities/UserDTO";

export class AdminRouter {
    constructor(private app: any) {

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