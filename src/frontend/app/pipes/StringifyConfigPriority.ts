import { Pipe, PipeTransform } from '@angular/core';
import { ConfigPriority } from '../../../common/config/public/ClientConfig';
import { SortingMethods } from '../../../common/entities/SortingMethods';
import {EnumTranslations} from '../ui/EnumTranslations';

@Pipe({ name: 'stringifyConfigPriority' })
export class StringifyConfigPriority implements PipeTransform {

  transform(method: ConfigPriority): string {
    return EnumTranslations[ConfigPriority[method]];
  }
}

