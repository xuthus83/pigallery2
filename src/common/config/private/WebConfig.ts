/* tslint:disable:no-inferrable-types */
import 'reflect-metadata';
import {ClientConfig} from '../public/ClientConfig';
import {ServerConfig} from './PrivateConfig';
import {WebConfigClass} from 'typeconfig/src/decorators/class/WebConfigClass';
import {ConfigProperty} from 'typeconfig/src/decorators/property/ConfigPropoerty';
import {ConfigDefaults} from 'typeconfig/src/decorators/property/ConfigDefaults';


@WebConfigClass()
export class WebConfig {
  @ConfigDefaults()
  Defaults: WebConfig;

  @ConfigProperty()
  Server: ServerConfig.Config = new ServerConfig.Config();
  @ConfigProperty()
  Client: ClientConfig.Config = new ClientConfig.Config();

}
