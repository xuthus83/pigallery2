import {Express} from 'express';
import {PublicRouter} from './PublicRouter';
import {UserRouter} from './UserRouter';
import {GalleryRouter} from './GalleryRouter';
import {PersonRouter} from './PersonRouter';
import {SharingRouter} from './SharingRouter';
import {AdminRouter} from './admin/AdminRouter';
import {SettingsRouter} from './admin/SettingsRouter';
import {NotificationRouter} from './NotificationRouter';
import {ErrorRouter} from './ErrorRouter';

export class Router {

  public static route(app: Express) {

    PublicRouter.route(app);

    UserRouter.route(app);
    GalleryRouter.route(app);
    PersonRouter.route(app);
    SharingRouter.route(app);
    AdminRouter.route(app);
    SettingsRouter.route(app);
    NotificationRouter.route(app);

    ErrorRouter.route(app);
  }
}
