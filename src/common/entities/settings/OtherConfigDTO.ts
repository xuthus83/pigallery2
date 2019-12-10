import {ClientConfig} from '../../config/public/ConfigClass';
import {ServerConfig} from '../../config/private/IPrivateConfig';

export interface OtherConfigDTO {
  Server: ServerConfig.ThreadingConfig;
  Client: ClientConfig.OtherConfig;
}
