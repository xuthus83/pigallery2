/* tslint:disable:no-inferrable-types */
import * as path from 'path';
import {ConfigClass, ConfigClassBuilder} from 'typeconfig/node';
import {ConfigProperty} from 'typeconfig/common';


@ConfigClass({
  configPath: path.join(__dirname, './../bm_config.json'),
  saveIfNotExist: true,
  attachDescription: true,
  enumsAsString: true,
  softReadonly: true,
  cli: {
    enable: {
      configPath: true,
      attachState: true,
      attachDescription: true,
      rewriteCLIConfig: true,
      rewriteENVConfig: true,
      enumsAsString: true,
      saveIfNotExist: true,
      exitOnConfig: true
    },
    defaults: {
      enabled: true
    }
  }
})
export class PrivateConfigClass {
  @ConfigProperty({description: 'Images are loaded from this folder (read permission required)'})
  path: string = 'demo/images';
  @ConfigProperty({description: 'Describe your system setup'})
  system: string = '';


}

export const BMConfig = ConfigClassBuilder.attachInterface(new PrivateConfigClass());
BMConfig.loadSync();
