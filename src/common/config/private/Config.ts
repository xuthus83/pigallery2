/* eslint-disable @typescript-eslint/no-var-requires */
import {ServerConfig} from './PrivateConfig';
import * as crypto from 'crypto';
import * as path from 'path';
import {ConfigClass, ConfigClassBuilder} from 'typeconfig/node';
import {IConfigClass} from 'typeconfig/common';

declare const process: any;

const upTime = new Date().toISOString();

@ConfigClass({
  configPath: path.join(__dirname, './../../../../config.json'),
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
      exitOnConfig: true,
    },
    defaults: {
      enabled: true,
    },
  },
})
export class PrivateConfigClass extends ServerConfig {

  constructor() {
    super();
    if (!this.Server.sessionSecret || this.Server.sessionSecret.length === 0) {
      this.Server.sessionSecret = [
        crypto.randomBytes(256).toString('hex'),
        crypto.randomBytes(256).toString('hex'),
        crypto.randomBytes(256).toString('hex'),
      ];
    }

    this.Environment.appVersion =
      require('../../../../package.json').version;
    this.Environment.buildTime =
      require('../../../../package.json').buildTime;
    this.Environment.buildCommitHash =
      require('../../../../package.json').buildCommitHash;
    this.Environment.upTime = upTime;
    this.Environment.isDocker = !!process.env.PI_DOCKER;
  }

  async original(): Promise<PrivateConfigClass & IConfigClass> {
    const pc = ConfigClassBuilder.attachInterface(new PrivateConfigClass());
    await pc.load();
    return pc;
  }
}

export const Config = ConfigClassBuilder.attachInterface(
  new PrivateConfigClass()
);
Config.loadSync();

