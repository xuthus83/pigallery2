import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {IAutoCompleteItem} from '../../../../../common/entities/AutoCompleteItem';
import {GalleryCacheService} from '../cache.gallery.service';
import {SearchQueryParserService} from './search-query-parser.service';
import {BehaviorSubject} from 'rxjs';
import {SearchQueryTypes, TextSearchQueryTypes} from '../../../../../common/entities/SearchQueryDTO';

@Injectable()
export class AutoCompleteService {

  private keywords: string[] = [];

  constructor(private _networkService: NetworkService,
              private _searchQueryParserService: SearchQueryParserService,
              private _galleryCacheService: GalleryCacheService) {
    this.keywords = Object.values(this._searchQueryParserService.keywords)
      .filter(k => k !== this._searchQueryParserService.keywords.or &&
        k !== this._searchQueryParserService.keywords.and &&
        k !== this._searchQueryParserService.keywords.portrait &&
        k !== this._searchQueryParserService.keywords.kmFrom &&
        k !== this._searchQueryParserService.keywords.NSomeOf)
      .map(k => k + ':');

    this.keywords.push(this._searchQueryParserService.keywords.and);
    this.keywords.push(this._searchQueryParserService.keywords.or);
    for (let i = 0; i < 10; i++) {
      this.keywords.push(i + this._searchQueryParserService.keywords.NSomeOf);
    }
  }

  public autoComplete(text: string): BehaviorSubject<RenderableAutoCompleteItem[]> {
    const items: BehaviorSubject<RenderableAutoCompleteItem[]> = new BehaviorSubject(
      this.sortResults(text, this.getQueryKeywords(text)));
    const cached = this._galleryCacheService.getAutoComplete(text);
    if (cached == null) {
      this._networkService.getJson<IAutoCompleteItem[]>('/autocomplete/' + text).then(ret => {
        this._galleryCacheService.setAutoComplete(text, ret);
        items.next(this.sortResults(text, ret.map(i => this.ACItemToRenderable(i)).concat(items.value)));
      });
    } else {
      items.next(this.sortResults(text, cached.map(i => this.ACItemToRenderable(i)).concat(items.value)));
    }
    return items;
  }

  private ACItemToRenderable(item: IAutoCompleteItem): RenderableAutoCompleteItem {
    if (!item.type) {
      return {text: item.text, queryHint: item.text};
    }
    if (TextSearchQueryTypes.includes(item.type) && item.type !== SearchQueryTypes.any_text) {
      return {
        text: item.text, type: item.type,
        queryHint:
          (<any>this._searchQueryParserService.keywords)[SearchQueryTypes[item.type]] + ':(' + item.text + ')'
      };
    }
    return {
      text: item.text, type: item.type, queryHint: item.text
    };
  }

  private sortResults(text: string, items: RenderableAutoCompleteItem[]) {
    return items.sort((a, b) => {
      if ((a.text.startsWith(text) && b.text.startsWith(text)) ||
        (!a.text.startsWith(text) && !b.text.startsWith(text))) {
        return a.text.localeCompare(b.text);
      } else if (a.text.startsWith(text)) {
        return -1;
      }
      return 1;
    });

  }

  private getQueryKeywords(text: string): RenderableAutoCompleteItem[] {
    return this.keywords
      .filter(key => key.startsWith(text))
      .map(key => ({
        text: key,
        queryHint: key
      }));
  }
}

export interface RenderableAutoCompleteItem extends IAutoCompleteItem {
  queryHint: string;
}
