import { AuthenticationMWs } from '../../middlewares/user/AuthenticationMWs';
import { UserRoles } from '../../../common/entities/UserDTO';
import { RenderingMWs } from '../../middlewares/RenderingMWs';
import { Express } from 'express';
import { SettingsMWs } from '../../middlewares/admin/SettingsMWs';
import { Config } from '../../../common/config/private/Config';

export class SettingsRouter {
  public static route(app: Express): void {
    this.addSettings(app);
  }

  private static addSettings(app: Express): void {
    app.get(
      Config.Client.apiPath + '/settings',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      RenderingMWs.renderConfig
    );

    app.put(
      Config.Client.apiPath + '/settings/database',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateDatabaseSettings,
      RenderingMWs.renderOK
    );

    app.put(
      Config.Client.apiPath + '/settings/map',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateMapSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/video',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateVideoSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/photo',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updatePhotoSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/metafile',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateMetaFileSettings,
      RenderingMWs.renderOK
    );

    app.put(
      Config.Client.apiPath + '/settings/authentication',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateAuthenticationSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/thumbnail',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateThumbnailSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/search',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateSearchSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/preview',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updatePreviewSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/faces',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateFacesSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/albums',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateAlbumsSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/share',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateShareSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/randomPhoto',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateRandomPhotoSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/basic',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateBasicSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/other',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateOtherSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/indexing',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateIndexingSettings,
      RenderingMWs.renderOK
    );
    app.put(
      Config.Client.apiPath + '/settings/jobs',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      SettingsMWs.updateJobSettings,
      RenderingMWs.renderOK
    );
  }
}
