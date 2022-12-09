import { AuthenticationMWs } from '../middlewares/user/AuthenticationMWs';
import { UserRoles } from '../../common/entities/UserDTO';
import { RenderingMWs } from '../middlewares/RenderingMWs';
import { SharingMWs } from '../middlewares/SharingMWs';
import * as express from 'express';
import { QueryParams } from '../../common/QueryParams';
import { ServerTimingMWs } from '../middlewares/ServerTimingMWs';
import {Config} from '../../common/config/private/Config';

export class SharingRouter {
  public static route(app: express.Express): void {
    this.addShareLogin(app);
    this.addGetSharing(app);
    this.addCreateSharing(app);
    this.addUpdateSharing(app);
    this.addListSharing(app);
    this.addDeleteSharing(app);
  }

  private static addShareLogin(app: express.Express): void {
    app.post(
      Config.Client.apiPath + '/share/login',
      AuthenticationMWs.inverseAuthenticate,
      AuthenticationMWs.shareLogin,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderSessionUser
    );
  }

  private static addGetSharing(app: express.Express): void {
    app.get(
      Config.Client.apiPath + '/share/:' + QueryParams.gallery.sharingKey_params,
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.LimitedGuest),
      SharingMWs.getSharing,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderSharing
    );
  }

  private static addCreateSharing(app: express.Express): void {
    app.post(
      [Config.Client.apiPath + '/share/:directory(*)', Config.Client.apiPath + '/share/', Config.Client.apiPath + '/share//'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      SharingMWs.createSharing,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderSharing
    );
  }

  private static addUpdateSharing(app: express.Express): void {
    app.put(
      [Config.Client.apiPath + '/share/:directory(*)', Config.Client.apiPath + '/share/', Config.Client.apiPath + '/share//'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      SharingMWs.updateSharing,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderSharing
    );
  }

  private static addDeleteSharing(app: express.Express): void {
    app.delete(
      [Config.Client.apiPath + '/share/:sharingKey'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SharingMWs.deleteSharing,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderResult
    );
  }

  private static addListSharing(app: express.Express): void {
    app.get(
      [Config.Client.apiPath + '/share/list'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      SharingMWs.listSharing,
      ServerTimingMWs.addServerTiming,
      RenderingMWs.renderSharingList
    );
  }
}
