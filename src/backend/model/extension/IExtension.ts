import * as express from 'express';
import {PrivateConfigClass} from '../../../common/config/private/Config';
import {ObjectManagers} from '../ObjectManagers';
import {ProjectPathClass} from '../../ProjectPath';
import {ExtensionEvent} from './ExtensionEvent';


export type IExtensionBeforeEventHandler<I, O> = (input: { inputs: I }, event: { stopPropagation: boolean }) => Promise<{ inputs: I } | O>;
export type IExtensionAfterEventHandler<O> = (output: O) => Promise<O>;


export interface IExtensionEvent<I, O> {
  before: (handler: IExtensionBeforeEventHandler<I, O>) => void;
  after: (handler: IExtensionAfterEventHandler<O>) => void
}

export interface IExtensionEvents {
  gallery: {
  //  indexing: IExtensionEvent<any, any>;
   // scanningDirectory: IExtensionEvent<any, any>;
    MetadataLoader: {
      loadPhotoMetadata: IExtensionEvent<any, any>
    }

    //listingDirectory: IExtensionEvent<any, any>;
    //searching: IExtensionEvent<any, any>;
  };
}

export interface IExtensionApp {
  expressApp: express.Express;
  config: PrivateConfigClass;
  objectManagers: ObjectManagers;
  paths: ProjectPathClass;
}

export interface IExtensionObject {
  app: IExtensionApp;
  events: IExtensionEvents;
}

export interface IServerExtension {
  init(app: IExtensionObject): Promise<void>;

  cleanUp?: () => Promise<void>;
}
