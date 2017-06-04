import {AuthenticationMWs} from "../middlewares/user/AuthenticationMWs";
import {UserRoles} from "../../common/entities/UserDTO";

export class SharingRouter {
    public static route(app: any) {

        this.addGetSharing(app);
        this.addUpdateSharing(app);
    }

    private static addGetSharing(app) {
        app.get("/api/share/:directory",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.User)
            //TODO: implement
        );
    };

    private static addUpdateSharing(app) {
        app.post("/api/share/:directory",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.User)
            //TODO: implement
        );
    };


}