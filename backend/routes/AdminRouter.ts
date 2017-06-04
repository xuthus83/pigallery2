import {AuthenticationMWs} from "../middlewares/user/AuthenticationMWs";
import {UserRoles} from "../../common/entities/UserDTO";

export class AdminRouter {
    public static route(app: any) {

        this.addResetDB(app);
        this.addIndexGallery(app);
    }

    private static addResetDB(app) {
        app.post("/api/admin/db/reset",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin)
            //TODO: implement
        );
    };

    private static addIndexGallery(app) {
        app.post("/api/admin/gallery/index",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.Admin)
            //TODO: implement
        );
    };


}