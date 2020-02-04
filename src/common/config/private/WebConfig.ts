/* tslint:disable:no-inferrable-types */
import 'reflect-metadata';
import {ClientConfig} from '../public/ClientConfig';
import {ServerConfig} from './PrivateConfig';
import {WebConfigClass} from 'typeconfig/web';
import {ConfigProperty, ConfigState} from 'typeconfig/common';


@WebConfigClass()
export class WebConfig {
  @ConfigState()
  State: any;

  @ConfigProperty()
  Server: ServerConfig.Config = new ServerConfig.Config();
  @ConfigProperty()
  Client: ClientConfig.Config = new ClientConfig.Config();

}
