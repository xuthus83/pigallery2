/* eslint-disable @typescript-eslint/no-inferrable-types */
import 'reflect-metadata';
import {ServerConfig} from './PrivateConfig';
import {WebConfigClass} from 'typeconfig/web';
import {ConfigState} from 'typeconfig/common';
import {WebConfigClassBuilder} from '../../../../node_modules/typeconfig/src/decorators/builders/WebConfigClassBuilder';
import {IWebConfigClassPrivate} from '../../../../node_modules/typeconfig/src/decorators/class/IWebConfigClass';
import {TAGS} from '../public/ClientConfig';


@WebConfigClass({softReadonly: true})
export class WebConfig extends ServerConfig {
  @ConfigState()
  State: any;

  clone(): IWebConfigClassPrivate<TAGS> & WebConfig {
    const wcg = WebConfigClassBuilder.attachPrivateInterface(new WebConfig());
    wcg.load(WebConfigClassBuilder.attachPrivateInterface(this).toJSON());
    return wcg;
  }
}
