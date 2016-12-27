import {AuthenticationMWs} from "../middlewares/user/AuthenticationMWs";
import {UserRoles} from "../../common/entities/UserDTO";

export class SharingRouter {
    constructor(private app: any) {

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
        this.app.post("/api/share/:directory",
            AuthenticationMWs.authenticate,
            AuthenticationMWs.authorise(UserRoles.User)
            //TODO: implement
        );
    };


}