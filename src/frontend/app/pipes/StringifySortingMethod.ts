import { Pipe, PipeTransform } from '@angular/core';
import { SortingMethods } from '../../../common/entities/SortingMethods';
import {EnumTranslations} from '../ui/EnumTranslations';

@Pipe({ name: 'stringifySorting' })
export class StringifySortingMethod implements PipeTransform {

  transform(method: SortingMethods): string {
    return EnumTranslations[SortingMethods[method]];
  }
}

