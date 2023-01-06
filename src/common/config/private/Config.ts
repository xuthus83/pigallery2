/* eslint-disable @typescript-eslint/no-var-requires */
import {ServerConfig} from './PrivateConfig';
import * as crypto from 'crypto';
import * as path from 'path';
import {ConfigClass, ConfigClassBuilder} from 'typeconfig/node';
import {IConfigClass} from 'typeconfig/common';
import {PasswordHelper} from '../../../backend/model/PasswordHelper';
import {TAGS} from '../public/ClientConfig';

declare const process: any;

const upTime = new Date().toISOString();

@ConfigClass<IConfigClass<TAGS> & ServerConfig>({
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
  onLoadedSync: async (config) => {
    let changed = false;
    for (let i = 0; i < config.Users.enforcedUsers.length; ++i) {
      const uc = config.Users.enforcedUsers[i];

      // encrypt password and save back to the config
      if (uc.password) {
        if (!uc.encryptedPassword) {
          uc.encryptedPassword = PasswordHelper.cryptPassword(uc.password);
        }
        uc.password = '';
        changed = true;
      }
      if (!uc.encrypted) {
        uc.encrypted = !!uc.encryptedPassword;
        changed = true;
      }
    }
    if (changed) {
      config.saveSync();
    }
  }
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
    const pc = ConfigClassBuilder.attachPrivateInterface(new PrivateConfigClass());
    await pc.load();
    return pc;
  }

}

export const Config = ConfigClassBuilder.attachInterface(
  new PrivateConfigClass()
);
Config.loadSync();

