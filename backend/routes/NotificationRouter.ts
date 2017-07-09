import {UserRoles} from "../../common/entities/UserDTO";
import {AuthenticationMWs} from "../middlewares/user/AuthenticationMWs";
import {RenderingMWs} from "../middlewares/RenderingMWs";
import {NotificationMWs} from "../middlewares/NotificationMWs";
import Request = Express.Request;
import Response = Express.Response;

export class NotificationRouter {
  public static route(app: any) {

    this.addGetNotifications(app);
  }

  private static addGetNotifications(app) {
    app.get("/api/notifications",
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      NotificationMWs.list,
      RenderingMWs.renderResult
    );
  };


}
