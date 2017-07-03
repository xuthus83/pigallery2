import {AuthenticationMWs} from "../middlewares/user/AuthenticationMWs";
import {UserRoles} from "../../common/entities/UserDTO";
import {RenderingMWs} from "../middlewares/RenderingMWs";
import {SharingMWs} from "../middlewares/SharingMWs";

export class SharingRouter {
  public static route(app: any) {

    this.addGetSharing(app);
    this.addCreateSharing(app);
    this.addUpdateSharing(app);
  }

  private static addGetSharing(app) {
    app.get("/api/share/:sharingKey",
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      SharingMWs.getSharing,
      RenderingMWs.renderSharing
    );
  };

  private static addCreateSharing(app) {
    app.post(["/api/share/:directory(*)", "/api/share/", "/api/share//"],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      SharingMWs.createSharing,
      RenderingMWs.renderSharing
    );
  };

  private static addUpdateSharing(app) {
    app.put(["/api/share/:directory(*)", "/api/share/", "/api/share//"],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      SharingMWs.updateSharing,
      RenderingMWs.renderSharing
    );
  };


}
