import {UserRoles} from '../../common/entities/UserDTO';
import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {RenderingMWs} from '../middlewares/RenderingMWs';
import {NotificationMWs} from '../middlewares/NotificationMWs';
import {Express} from 'express';

export class NotificationRouter {
  public static route(app: Express) {

    this.addGetNotifications(app);
  }

  private static addGetNotifications(app: Express) {
    app.get('/api/notifications',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      NotificationMWs.list,
      RenderingMWs.renderResult
    );
  }

}
