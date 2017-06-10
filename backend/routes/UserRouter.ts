import {UserMWs} from "../middlewares/user/UserMWs";
import {UserRoles} from "../../common/entities/UserDTO";
import {AuthenticationMWs} from "../middlewares/user/AuthenticationMWs";
import {UserRequestConstrainsMWs} from "../middlewares/user/UserRequestConstrainsMWs";
import {RenderingMWs} from "../middlewares/RenderingMWs";

export class UserRouter {
  public static route(app) {
    this.addLogin(app);
    this.addLogout(app);
    this.addGetSessionUser(app);
    this.addChangePassword(app);


    this.addCreateUser(app);
    this.addDeleteUser(app);
    this.addListUsers(app);
    this.addChangeRole(app);
  }

  private static addLogin(app) {
    app.post("/api/user/login",
      AuthenticationMWs.inverseAuthenticate,
      AuthenticationMWs.login,
      RenderingMWs.renderSessionUser
    );
  };

  private static addLogout(app) {
    app.post("/api/user/logout",
      AuthenticationMWs.authenticate,
      AuthenticationMWs.logout,
      RenderingMWs.renderOK
    );
  };


  private static addGetSessionUser(app) {
    app.get("/api/user/login",
      AuthenticationMWs.authenticate,
      RenderingMWs.renderSessionUser
    );
  };


  private static addChangePassword(app) {
    app.post("/api/user/:id/password",
      AuthenticationMWs.authenticate,
      UserRequestConstrainsMWs.forceSelfRequest,
      UserMWs.changePassword,
      RenderingMWs.renderOK
    );
  };


  private static addCreateUser(app) {
    app.put("/api/user",
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      UserMWs.createUser,
      RenderingMWs.renderOK
    );
  };

  private static addDeleteUser(app) {
    app.delete("/api/user/:id",
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      UserRequestConstrainsMWs.notSelfRequest,
      UserMWs.deleteUser,
      RenderingMWs.renderOK
    );
  };


  private static addListUsers(app) {
    app.get("/api/user/list",
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      UserMWs.listUsers,
      RenderingMWs.renderResult
    );
  };

  private static addChangeRole(app) {
    app.post("/api/user/:id/role",
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      UserRequestConstrainsMWs.notSelfRequestOr2Admins,
      UserMWs.changeRole,
      RenderingMWs.renderOK
    );
  };


}
