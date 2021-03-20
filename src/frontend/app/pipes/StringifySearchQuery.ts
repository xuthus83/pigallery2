import {Pipe, PipeTransform} from '@angular/core';
import {SearchQueryDTO} from '../../../common/entities/SearchQueryDTO';
import {SearchQueryParserService} from '../ui/gallery/search/search-query-parser.service';


@Pipe({name: 'searchQuery'})
export class StringifySearchQuery implements PipeTransform {
  constructor(
    private _searchQueryParserService: SearchQueryParserService) {
  }

  transform(query: SearchQueryDTO): string {
    return this._searchQueryParserService.stringify(query);
  }
}

