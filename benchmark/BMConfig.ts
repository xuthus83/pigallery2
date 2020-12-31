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
    prefix: 'bm-config',
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
  path: string = '/app/data/images';
  @ConfigProperty({description: 'Describe your system setup'})
  system: string = '';
  @ConfigProperty({description: 'Number of times to run the benchmark'})
  RUNS: number = 50;


}

export const BMConfig = ConfigClassBuilder.attachInterface(new PrivateConfigClass());
BMConfig.loadSync();
