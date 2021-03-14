import {Pipe, PipeTransform} from '@angular/core';
import {SearchQueryDTO} from '../../../common/entities/SearchQueryDTO';


@Pipe({name: 'searchQuery'})
export class StringifySearchQuery implements PipeTransform {
  transform(query: SearchQueryDTO): string {
    return SearchQueryDTO.stringify(query);
  }
}

