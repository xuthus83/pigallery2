import * as express from 'express';
import {NextFunction, Request, Response} from 'express';
import {PrivateConfigClass} from '../../../common/config/private/Config';
import {ObjectManagers} from '../ObjectManagers';
import {ProjectPathClass} from '../../ProjectPath';
import {ILogger} from '../../Logger';
import {UserDTO, UserRoles} from '../../../common/entities/UserDTO';
import {ParamsDictionary} from 'express-serve-static-core';
import {Connection, EntitySchema} from 'typeorm';


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
  /**
   * Sends a pigallery2 standard JSON object with payload or error message back to the client.
   * @param paths
   * @param minRole
   * @param cb
   */
  jsonResponse(paths: string[], minRole: UserRoles, cb: (params?: ParamsDictionary, body?: any, user?: UserDTO) => Promise<unknown> | unknown): void;

  /**
   * Exposes a standard expressjs middleware
   * @param paths
   * @param minRole
   * @param mw
   */
  rawMiddleware(paths: string[], minRole: UserRoles, mw: (req: Request, res: Response, next: NextFunction) => void | Promise<void>): void;
}

export interface IExtensionRESTApi {
  use: IExtensionRESTRoute;
  get: IExtensionRESTRoute;
  post: IExtensionRESTRoute;
  put: IExtensionRESTRoute;
  delete: IExtensionRESTRoute;
}

export interface IExtensionDB {
  /**
   * Returns with a typeorm SQL connection
   */
  getSQLConnection(): Promise<Connection>;

  /**
   * Adds SQL tables to typeorm
   * @param tables
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  setExtensionTables(tables: Function[]): Promise<void>;

  /**
   * Exposes all tables. You can use this if you van to have a foreign key to a built in table.
   * Use with caution. This exposes the app's internal working.
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  _getAllTables(): Function[];
}

export interface IExtensionObject {
  /**
   * Inner functionality of the app. Use this with caution.
   * If you want to go deeper than the standard exposed APIs, you can try doing so here.
   */
  _app: IExtensionApp;

  /**
   * Create new SQL tables and access SQL connection
   */
  db: IExtensionDB;

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
  /**
   * Extension init function. Extension should at minimum expose this function.
   * @param extension
   */
  init(extension: IExtensionObject): Promise<void>;

  cleanUp?: (extension: IExtensionObject) => Promise<void>;
}
