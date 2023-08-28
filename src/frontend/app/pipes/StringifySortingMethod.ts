import {Pipe, PipeTransform} from '@angular/core';
import {SortingByTypes} from '../../../common/entities/SortingMethods';
import {EnumTranslations} from '../ui/EnumTranslations';

@Pipe({name: 'stringifySorting'})
export class StringifySortingMethod implements PipeTransform {

  transform(method: SortingByTypes): string {
    return EnumTranslations[SortingByTypes[method]];
  }
}

