import {Pipe, PipeTransform} from '@angular/core';
import {SearchQueryDTO} from '../../../common/entities/SearchQueryDTO';


@Pipe({name: 'searchQuery'})
export class StringifySearchQuery implements PipeTransform {
  transform(query: SearchQueryDTO): string {
    console.log(query);
    console.log(SearchQueryDTO.stringify(query));
    return SearchQueryDTO.stringify(query);
  }
}

