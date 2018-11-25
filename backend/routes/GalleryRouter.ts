import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {GalleryMWs} from '../middlewares/GalleryMWs';
import {RenderingMWs} from '../middlewares/RenderingMWs';
import {ThumbnailGeneratorMWs} from '../middlewares/thumbnail/ThumbnailGeneratorMWs';
import {UserRoles} from '../../common/entities/UserDTO';
import {ThumbnailSourceType} from '../model/threading/ThumbnailWorker';

export class GalleryRouter {
  public static route(app: any) {

    this.addGetImageIcon(app);
    this.addGetImageThumbnail(app);
    this.addGetVideoThumbnail(app);
    this.addGetImage(app);
    this.addGetVideo(app);
    this.addRandom(app);
    this.addDirectoryList(app);

    this.addSearch(app);
    this.addInstantSearch(app);
    this.addAutoComplete(app);
  }

  private static addDirectoryList(app) {
    app.get(['/api/gallery/content/:directory(*)', '/api/gallery/', '/api/gallery//'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authoriseDirectory,
      GalleryMWs.listDirectory,
      ThumbnailGeneratorMWs.addThumbnailInformation,
      GalleryMWs.cleanUpGalleryResults,
      RenderingMWs.renderResult
    );
  }


  private static addGetImage(app) {
    app.get(['/api/gallery/content/:mediaPath(*\.(jpg|bmp|png|gif|jpeg))'],
      AuthenticationMWs.authenticate,
      // TODO: authorize path
      GalleryMWs.loadMedia,
      RenderingMWs.renderFile
    );
  }

  private static addGetVideo(app) {
    app.get(['/api/gallery/content/:mediaPath(*\.(mp4|ogg|ogv|webm))'],
      AuthenticationMWs.authenticate,
      // TODO: authorize path
      GalleryMWs.loadMedia,
      RenderingMWs.renderFile
    );
  }

  private static addRandom(app) {
    app.get(['/api/gallery/random'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      // TODO: authorize path
      GalleryMWs.getRandomImage,
      GalleryMWs.loadMedia,
      RenderingMWs.renderFile
    );
  }

  private static addGetImageThumbnail(app) {
    app.get('/api/gallery/content/:mediaPath(*\.(jpg|bmp|png|gif|jpeg))/thumbnail/:size?',
      AuthenticationMWs.authenticate,
      // TODO: authorize path
      GalleryMWs.loadMedia,
      ThumbnailGeneratorMWs.generateThumbnailFactory(ThumbnailSourceType.Image),
      RenderingMWs.renderFile
    );
  }

  private static addGetVideoThumbnail(app) {
    app.get('/api/gallery/content/:mediaPath(*\.(mp4|ogg|ogv|webm))/thumbnail/:size?',
      AuthenticationMWs.authenticate,
      // TODO: authorize path
      GalleryMWs.loadMedia,
      ThumbnailGeneratorMWs.generateThumbnailFactory(ThumbnailSourceType.Video),
      RenderingMWs.renderFile
    );
  }

  private static addGetImageIcon(app) {
    app.get('/api/gallery/content/:mediaPath(*\.(jpg|bmp|png|gif|jpeg))/icon',
      AuthenticationMWs.authenticate,
      // TODO: authorize path
      GalleryMWs.loadMedia,
      ThumbnailGeneratorMWs.generateIconFactory(ThumbnailSourceType.Image),
      RenderingMWs.renderFile
    );
  }

  private static addSearch(app) {
    app.get('/api/search/:text',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      GalleryMWs.search,
      ThumbnailGeneratorMWs.addThumbnailInformation,
      GalleryMWs.cleanUpGalleryResults,
      RenderingMWs.renderResult
    );
  }

  private static addInstantSearch(app) {
    app.get('/api/instant-search/:text',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      GalleryMWs.instantSearch,
      ThumbnailGeneratorMWs.addThumbnailInformation,
      GalleryMWs.cleanUpGalleryResults,
      RenderingMWs.renderResult
    );
  }

  private static addAutoComplete(app) {
    app.get('/api/autocomplete/:text',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      GalleryMWs.autocomplete,
      RenderingMWs.renderResult
    );
  }

}
