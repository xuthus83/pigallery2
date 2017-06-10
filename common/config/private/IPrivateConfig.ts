export enum DatabaseType{
    memory = 0, mysql = 1
}
export enum LogLevel {
    error, warn, info, debug, verbose
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
    hardwareAcceleration: boolean;
    qualityPriority: boolean;
}

export interface ServerConfig {
    port: number;
    imagesFolder: string;
    thumbnail: ThumbnailConfig;
    database: DataBaseConfig;
    enableThreading:boolean;
}
