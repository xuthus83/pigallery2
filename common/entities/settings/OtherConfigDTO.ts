import {ClientConfig} from '../../config/public/ConfigClass';
import {ThreadingConfig} from '../../config/private/IPrivateConfig';

export interface OtherConfigDTO {
  Server: ThreadingConfig;
  Client: ClientConfig.OtherConfig;
}
