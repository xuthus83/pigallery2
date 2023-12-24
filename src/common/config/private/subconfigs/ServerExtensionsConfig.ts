/* eslint-disable @typescript-eslint/no-inferrable-types */
import {ConfigProperty, SubConfigClass} from 'typeconfig/common';
import {ClientExtensionsConfig, ConfigPriority, TAGS} from '../../public/ClientConfig';
import {IConfigClassPrivate} from '../../../../../node_modules/typeconfig/src/decorators/class/IConfigClass';

@SubConfigClass<TAGS>({softReadonly: true})
export class ServerExtensionsEntryConfig {

  constructor(path: string = '') {
    this.path = path;
  }

  @ConfigProperty({
    tags: {
      name: $localize`Enabled`,
      priority: ConfigPriority.advanced,
    },
  })
  enabled: boolean = true;

  @ConfigProperty({
    tags: {
      name: $localize`Extension folder`,
      priority: ConfigPriority.underTheHood,
    },
    description: $localize`Folder where the app stores all extensions. Individual extensions live in their own sub-folders.`,
  })
  path: string = '';

  @ConfigProperty({
    tags: {
      name: $localize`Config`,
      priority: ConfigPriority.advanced
    }
  })
  configs: IConfigClassPrivate<unknown>;
}

@SubConfigClass<TAGS>({softReadonly: true})
export class ServerExtensionsConfig extends ClientExtensionsConfig {

  @ConfigProperty({
    tags: {
      name: $localize`Extension folder`,
      priority: ConfigPriority.underTheHood,
      dockerSensitive: true
    },
    description: $localize`Folder where the app stores all extensions. Individual extensions live in their own sub-folders.`,
  })
  folder: string = 'extensions';


  @ConfigProperty({
    arrayType: ServerExtensionsEntryConfig,
    tags: {
      name: $localize`Installed extensions`,
      priority: ConfigPriority.advanced
    }
  })
  extensions: ServerExtensionsEntryConfig[] = [];

  @ConfigProperty({
    tags: {
      name: $localize`Installed extensions2`,
      priority: ConfigPriority.advanced
    }
  })
  extensions2: Record<string, ServerExtensionsEntryConfig> = {};

  @ConfigProperty({
    tags: {
      name: $localize`Clean up unused tables`,
      priority: ConfigPriority.underTheHood,
    },
    description: $localize`Automatically removes all tables from the DB that are not used anymore.`,
  })
  cleanUpUnusedTables: boolean = true;
}
