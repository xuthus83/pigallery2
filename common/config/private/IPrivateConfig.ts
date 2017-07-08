import {ClientConfig} from "../public/ConfigClass";
export enum DatabaseType{
  memory = 0, mysql = 1
}
export enum LogLevel {
  error, warn, info, debug, verbose
}

export enum ThumbnailProcessingLib{
  Jimp = 0,
  gm = 1,
  sharp = 2
}

export interface MySQLConfig {
  host: string;
  database: string;
  username: string;
  password: string;
}
export interface DataBaseConfig {
  type: DatabaseType;
  mysql?: MySQLConfig;
}
export interface ThumbnailConfig {
  folder: string;
  processingLibrary: ThumbnailProcessingLib;
  qualityPriority: boolean;
}
export interface SharingConfig {
  updateTimeout: number;
}
export interface ServerConfig {
  port: number;
  imagesFolder: string;
  thumbnail: ThumbnailConfig;
  database: DataBaseConfig;
  enableThreading: boolean;
  sharing: SharingConfig;
}
export interface IPrivateConfig {
  Server: ServerConfig;
  Client: ClientConfig;
}
