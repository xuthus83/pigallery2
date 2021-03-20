import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {AutoCompleteItem} from '../../../../../common/entities/AutoCompleteItem';
import {GalleryCacheService} from '../cache.gallery.service';
import {SearchQueryParserService} from './search-query-parser.service';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class AutoCompleteService {


  constructor(private _networkService: NetworkService,
              private _searchQueryParserService: SearchQueryParserService,
              private _galleryCacheService: GalleryCacheService) {
  }

  public autoComplete(text: string): BehaviorSubject<AutoCompleteItem[]> {
    const items: BehaviorSubject<AutoCompleteItem[]> = new BehaviorSubject(
      this.sortResults(text, this.getQueryKeywords(text)));
    const cached = this._galleryCacheService.getAutoComplete(text);
    if (cached == null) {
      this._networkService.getJson<AutoCompleteItem[]>('/autocomplete/' + text).then(ret => {
        this._galleryCacheService.setAutoComplete(text, ret);
        items.next(this.sortResults(text, ret.concat(items.value)));
      });
    }
    return items;
  }

  private sortResults(text: string, items: AutoCompleteItem[]) {
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

  private getQueryKeywords(text: string) {
    return Object.values(this._searchQueryParserService.keywords)
      .filter(key => key.startsWith(text))
      .map(key => new AutoCompleteItem(key + ':'));
  }
}
