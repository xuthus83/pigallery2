import {Config} from '../../../../../common/config/private/Config';
import {ServerConfig} from '../../../../../common/config/private/IPrivateConfig';
import {ColumnOptions} from 'typeorm/decorator/options/ColumnOptions';

export class ColumnCharsetCS implements ColumnOptions {

  public get charset(): string {
    return Config.Server.Database.type === ServerConfig.DatabaseType.mysql ? 'utf8' : 'utf8';
  }

  public get collation(): string {
    return Config.Server.Database.type === ServerConfig.DatabaseType.mysql ? 'utf8_bin' : null;

  }
}

export const columnCharsetCS = new ColumnCharsetCS();
