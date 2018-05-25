import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {UserRoles} from '../../common/entities/UserDTO';
import {RenderingMWs} from '../middlewares/RenderingMWs';
import {SharingMWs} from '../middlewares/SharingMWs';
import * as express from 'express';

export class SharingRouter {
  public static route(app: express.Express) {

    this.addShareLogin(app);
    this.addGetSharing(app);
    this.addCreateSharing(app);
    this.addUpdateSharing(app);
  }

  private static addShareLogin(app: express.Express) {
    app.post('/api/share/login',
      AuthenticationMWs.inverseAuthenticate,
      AuthenticationMWs.shareLogin,
      RenderingMWs.renderSessionUser
    );
  }

  private static addGetSharing(app: express.Express) {
    app.get('/api/share/:sharingKey',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.LimitedGuest),
      SharingMWs.getSharing,
      RenderingMWs.renderSharing
    );
  }

  private static addCreateSharing(app: express.Express) {
    app.post(['/api/share/:directory(*)', '/api/share/', '/api/share//'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      SharingMWs.createSharing,
      RenderingMWs.renderSharing
    );
  }

  private static addUpdateSharing(app: express.Express) {
    app.put(['/api/share/:directory(*)', '/api/share/', '/api/share//'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.User),
      SharingMWs.updateSharing,
      RenderingMWs.renderSharing
    );
  }

}
