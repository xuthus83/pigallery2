import {ConfigProperty, IConfigClass} from 'typeconfig/common';
import {Config, PrivateConfigClass} from '../../../common/config/private/Config';
import {ConfigClassBuilder} from 'typeconfig/node';
import {IExtensionConfig} from './IExtension';
import {ObjectManagers} from '../ObjectManagers';
import {ServerExtensionsEntryConfig} from '../../../common/config/private/subconfigs/ServerExtensionsConfig';

/**
 * Wraps to original config and makes sure all extension related config is loaded
 */
export class ExtensionConfigWrapper {
  static async original(): Promise<PrivateConfigClass & IConfigClass> {
    const pc = ConfigClassBuilder.attachPrivateInterface(new PrivateConfigClass());
    try {
      await pc.load();
      if (ObjectManagers.isReady()) {
        for (const ext of Object.values(ObjectManagers.getInstance().ExtensionManager.extObjects)) {
          ext.config.loadToConfig(ConfigClassBuilder.attachPrivateInterface(pc));
        }
      }
    } catch (e) {
      console.error('Error during loading original config. Reverting to defaults.');
      console.error(e);
    }
    return pc;
  }
}

export class ExtensionConfig<C> implements IExtensionConfig<C> {
  public template: new() => C;

  constructor(private readonly extensionFolder: string) {
  }

  private findConfig(config: PrivateConfigClass) {
    let c = (config.Extensions.extensions || []).find(e => e.path === this.extensionFolder);
    if (!c) {
      c = new ServerExtensionsEntryConfig(this.extensionFolder);
      config.Extensions.extensions.push(c);
    }

    if (!config.Extensions.extensions2[this.extensionFolder]) {
      Object.defineProperty(config.Extensions.extensions2, this.extensionFolder,
        ConfigProperty({type: ServerExtensionsEntryConfig})(config.Extensions.extensions2, this.extensionFolder));
      // config.Extensions.extensions2[this.extensionFolder] = c as any;

      config.Extensions.extensions2[this.extensionFolder] = c;

    }
    return config.Extensions.extensions2[this.extensionFolder];
  }

  public getConfig(): C {
    return this.findConfig(Config).configs as C;
  }

  public setTemplate(template: new() => C): void {
    this.template = template;
    this.loadToConfig(Config);
  }

  loadToConfig(config: PrivateConfigClass) {
    if (!this.template) {
      return;
    }

    const confTemplate = ConfigClassBuilder.attachPrivateInterface(new this.template());
    const extConf = this.findConfig(config);
    //   confTemplate.__loadJSONObject(Utils.clone(extConf.configs || {}));
    //extConf.configs = confTemplate;
    Object.defineProperty(config.Extensions.extensions2[this.extensionFolder].configs, this.extensionFolder,
      ConfigProperty({type: this.template})(config.Extensions.extensions2[this.extensionFolder], this.extensionFolder));
    console.log(config.Extensions.extensions2[this.extensionFolder].configs);
    config.Extensions.extensions2[this.extensionFolder].configs = confTemplate as any;
    console.log(config.Extensions.extensions2[this.extensionFolder].configs);
  }
}
