import * as express from 'express';
import {NextFunction, Request, Response} from 'express';
import {PrivateConfigClass} from '../../../common/config/private/Config';
import {ObjectManagers} from '../ObjectManagers';
import {ProjectPathClass} from '../../ProjectPath';
import {ILogger} from '../../Logger';
import {UserDTO, UserRoles} from '../../../common/entities/UserDTO';
import {ParamsDictionary} from 'express-serve-static-core';


export type IExtensionBeforeEventHandler<I, O> = (input: { inputs: I }, event: { stopPropagation: boolean }) => Promise<{ inputs: I } | O>;
export type IExtensionAfterEventHandler<O> = (output: O) => Promise<O>;


export interface IExtensionEvent<I, O> {
  before: (handler: IExtensionBeforeEventHandler<I, O>) => void;
  after: (handler: IExtensionAfterEventHandler<O>) => void;
}

/**
 * All main event callbacks in the app
 */
export interface IExtensionEvents {
  gallery: {
    /**
     * Events for Directory and Album covers
     */
    CoverManager: {
      getCoverForAlbum: IExtensionEvent<any, any>;
      getCoverForDirectory: IExtensionEvent<any, any>
      /**
       * Invalidates directory covers for a given directory and every parent
       */
      invalidateDirectoryCovers: IExtensionEvent<any, any>;
    },
    ImageRenderer: {
      /**
       * Renders a thumbnail or photo
       */
      render: IExtensionEvent<any, any>
    },
    /**
     * Reads exif, iptc, etc.. metadata for photos/videos
     */
    MetadataLoader: {
      loadVideoMetadata: IExtensionEvent<any, any>,
      loadPhotoMetadata: IExtensionEvent<any, any>
    },
    /**
     * Scans the storage for a given directory and returns the list of child directories,
     * photos, videos and metafiles
     */
    DiskManager: {
      scanDirectory: IExtensionEvent<any, any>
    }
  };
}

export interface IExtensionApp {
  expressApp: express.Express;
  objectManagers: ObjectManagers;
  config: PrivateConfigClass;
}

export interface IExtensionRESTRoute {
  jsonResponse(paths: string[], minRole: UserRoles, cb: (params?: ParamsDictionary, body?: any, user?: UserDTO) => Promise<unknown> | unknown): void;

  rawMiddleware(paths: string[], minRole: UserRoles, mw: (req: Request, res: Response, next: NextFunction) => void | Promise<void>): void;
}

export interface IExtensionRESTApi {
  use: IExtensionRESTRoute;
  get: IExtensionRESTRoute;
  post: IExtensionRESTRoute;
  put: IExtensionRESTRoute;
  delete: IExtensionRESTRoute;
}

export interface IExtensionObject {
  /**
   * Inner functionality of the app. Use this wit caution
   */
  _app: IExtensionApp;
  /**
   * Paths to the main components of the app.
   */
  paths: ProjectPathClass;
  /**
   * Logger of the app
   */
  Logger: ILogger;
  /**
   * Main app events. Use this change indexing, cover or serving gallery
   */
  events: IExtensionEvents;
  /**
   * Use this to define REST calls related to the extension
   */
  RESTApi: IExtensionRESTApi;
}


/**
 * Extension interface. All extension is expected to implement and export these methods
 */
export interface IServerExtension {
  init(extension: IExtensionObject): Promise<void>;

  cleanUp?: (extension: IExtensionObject) => Promise<void>;
}
