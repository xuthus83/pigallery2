import {Injectable} from '@angular/core';
import {QueryKeywords, SearchQueryParser} from '../../../../../common/SearchQueryParser';
import {SearchQueryDTO} from '../../../../../common/entities/SearchQueryDTO';

@Injectable()
export class SearchQueryParserService {

  public readonly keywords: QueryKeywords = {
    NSomeOf: 'of',
    and: 'and',
    caption: 'caption',
    directory: 'directory',
    file_name: 'file-name',
    from: 'from',
    keyword: 'keyword',
    landscape: 'landscape',
    maxRating: 'max-rating',
    maxResolution: 'max-resolution',
    minRating: 'min-rating',
    minResolution: 'min-resolution',
    or: 'or',
    orientation: 'orientation',
    any_text: 'any-text',
    person: 'person',
    portrait: 'portrait',
    position: 'position',
    someOf: 'some-of',
    to: 'to',
    kmFrom: 'km-from'
  };
  private readonly parser: SearchQueryParser;

  constructor() {
    this.parser = new SearchQueryParser(this.keywords);
  }


  public parse(str: string): SearchQueryDTO {
    return this.parser.parse(str);
  }

  stringify(query: SearchQueryDTO): string {
    return this.parser.stringify(query);
  }


}
