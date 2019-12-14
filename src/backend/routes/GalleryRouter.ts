import {AuthenticationMWs} from '../middlewares/user/AuthenticationMWs';
import {Express} from 'express';
import {GalleryMWs} from '../middlewares/GalleryMWs';
import {RenderingMWs} from '../middlewares/RenderingMWs';
import {ThumbnailGeneratorMWs} from '../middlewares/thumbnail/ThumbnailGeneratorMWs';
import {UserRoles} from '../../common/entities/UserDTO';
import {ThumbnailSourceType} from '../model/threading/ThumbnailWorker';
import {VersionMWs} from '../middlewares/VersionMWs';
import {SupportedFormats} from '../../common/SupportedFormats';
import {PhotoConverterMWs} from '../middlewares/thumbnail/PhotoConverterMWs';

export class GalleryRouter {
  public static route(app: Express) {

    this.addGetImageIcon(app);
    this.addGetVideoIcon(app);
    this.addGetPhotoThumbnail(app);
    this.addGetVideoThumbnail(app);
    this.addGetBestFitImage(app);
    this.addGetImage(app);
    this.addGetBestFitVideo(app);
    this.addGetVideo(app);
    this.addGetMetaFile(app);
    this.addRandom(app);
    this.addDirectoryList(app);

    this.addSearch(app);
    this.addInstantSearch(app);
    this.addAutoComplete(app);
  }

  private static addDirectoryList(app: Express) {
    app.get(['/api/gallery/content/:directory(*)', '/api/gallery/', '/api/gallery//'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('directory'),
      AuthenticationMWs.authorisePath('directory', true),
      VersionMWs.injectGalleryVersion,
      GalleryMWs.listDirectory,
      ThumbnailGeneratorMWs.addThumbnailInformation,
      GalleryMWs.cleanUpGalleryResults,
      RenderingMWs.renderResult
    );
  }


  private static addGetImage(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Photos.join('|') + '))'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),
      GalleryMWs.loadFile,
      RenderingMWs.renderFile
    );
  }

  private static addGetBestFitImage(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Photos.join('|') + '))/bestFit'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),
      GalleryMWs.loadFile,
      PhotoConverterMWs.convertPhoto,
      RenderingMWs.renderFile
    );
  }

  private static addGetVideo(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Videos.join('|') + '))'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),
      GalleryMWs.loadFile,
      RenderingMWs.renderFile
    );
  }

  private static addGetBestFitVideo(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Videos.join('|') + '))/bestFit'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),
      GalleryMWs.loadFile,
      GalleryMWs.loadBestFitVideo,
      RenderingMWs.renderFile
    );
  }

  private static addGetMetaFile(app: Express) {
    app.get(['/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.MetaFiles.join('|') + '))'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),
      GalleryMWs.loadFile,
      RenderingMWs.renderFile
    );
  }

  private static addRandom(app: Express) {
    app.get(['/api/gallery/random'],
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      VersionMWs.injectGalleryVersion,
      GalleryMWs.getRandomImage,
      GalleryMWs.loadFile,
      RenderingMWs.renderFile
    );
  }

  private static addGetPhotoThumbnail(app: Express) {
    app.get('/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Photos.join('|') + '))/thumbnail/:size?',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),
      GalleryMWs.loadFile,
      ThumbnailGeneratorMWs.generateThumbnailFactory(ThumbnailSourceType.Photo),
      RenderingMWs.renderFile
    );
  }

  private static addGetVideoThumbnail(app: Express) {
    app.get('/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Videos.join('|') + '))/thumbnail/:size?',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),
      GalleryMWs.loadFile,
      ThumbnailGeneratorMWs.generateThumbnailFactory(ThumbnailSourceType.Video),
      RenderingMWs.renderFile
    );
  }


  private static addGetVideoIcon(app: Express) {
    app.get('/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Videos.join('|') + '))/icon',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),
      GalleryMWs.loadFile,
      ThumbnailGeneratorMWs.generateIconFactory(ThumbnailSourceType.Video),
      RenderingMWs.renderFile
    );
  }

  private static addGetImageIcon(app: Express) {
    app.get('/api/gallery/content/:mediaPath(*\.(' + SupportedFormats.Photos.join('|') + '))/icon',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.normalizePathParam('mediaPath'),
      AuthenticationMWs.authorisePath('mediaPath', false),
      GalleryMWs.loadFile,
      ThumbnailGeneratorMWs.generateIconFactory(ThumbnailSourceType.Photo),
      RenderingMWs.renderFile
    );
  }

  private static addSearch(app: Express) {
    app.get('/api/search/:text',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      VersionMWs.injectGalleryVersion,
      GalleryMWs.search,
      ThumbnailGeneratorMWs.addThumbnailInformation,
      GalleryMWs.cleanUpGalleryResults,
      RenderingMWs.renderResult
    );
  }

  private static addInstantSearch(app: Express) {
    app.get('/api/instant-search/:text',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      VersionMWs.injectGalleryVersion,
      GalleryMWs.instantSearch,
      ThumbnailGeneratorMWs.addThumbnailInformation,
      GalleryMWs.cleanUpGalleryResults,
      RenderingMWs.renderResult
    );
  }

  private static addAutoComplete(app: Express) {
    app.get('/api/autocomplete/:text',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Guest),
      VersionMWs.injectGalleryVersion,
      GalleryMWs.autocomplete,
      RenderingMWs.renderResult
    );
  }

}
