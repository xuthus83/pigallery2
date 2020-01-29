import {ServerConfig} from '../../config/private/PrivateConfig';
import {ClientConfig} from '../../config/public/ClientConfig';


export interface OtherConfigDTO {
  Server: ServerConfig.ThreadingConfig;
  Client: ClientConfig.OtherConfig;
}
