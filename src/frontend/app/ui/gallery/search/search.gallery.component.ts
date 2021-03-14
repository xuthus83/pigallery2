import {Component, OnDestroy, TemplateRef} from '@angular/core';
import {AutoCompleteService} from './autocomplete.service';
import {AutoCompleteItem} from '../../../../../common/entities/AutoCompleteItem';
import {ActivatedRoute, Params, Router, RouterLink} from '@angular/router';
import {GalleryService} from '../gallery.service';
import {Subscription} from 'rxjs';
import {Config} from '../../../../../common/config/public/Config';
import {NavigationService} from '../../../model/navigation.service';
import {QueryParams} from '../../../../../common/QueryParams';
import {MetadataSearchQueryTypes, SearchQueryDTO, SearchQueryTypes, TextSearch} from '../../../../../common/entities/SearchQueryDTO';
import {BsModalService} from 'ngx-bootstrap/modal';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-gallery-search',
  templateUrl: './search.gallery.component.html',
  styleUrls: ['./search.gallery.component.css'],
  providers: [AutoCompleteService, RouterLink]
})
export class GallerySearchComponent implements OnDestroy {

  autoCompleteItems: AutoCompleteRenderItem[] = [];
  public searchQueryDTO: SearchQueryDTO = <TextSearch>{type: SearchQueryTypes.any_text, text: ''};
  public rawSearchText: string;
  mouseOverAutoComplete = false;
  readonly SearchQueryTypes: typeof SearchQueryTypes;
  modalRef: BsModalRef;
  public readonly MetadataSearchQueryTypes: { value: string; key: SearchQueryTypes }[];
  private cache = {
    lastAutocomplete: '',
    lastInstantSearch: ''
  };
  private readonly subscription: Subscription = null;

  constructor(private _autoCompleteService: AutoCompleteService,
              private _galleryService: GalleryService,
              private navigationService: NavigationService,
              private _route: ActivatedRoute,
              public router: Router,
              private modalService: BsModalService) {

    this.SearchQueryTypes = SearchQueryTypes;
    this.MetadataSearchQueryTypes = MetadataSearchQueryTypes.map(v => ({key: v, value: SearchQueryTypes[v]}));

    this.subscription = this._route.params.subscribe((params: Params) => {
      if (!params[QueryParams.gallery.search.query]) {
        return;
      }
      const searchQuery = JSON.parse(params[QueryParams.gallery.search.query]);
      if (searchQuery) {
        this.searchQueryDTO = searchQuery;
        this.onQueryChange();
      }
    });
  }


  get HTMLSearchQuery() {
    return JSON.stringify(this.searchQueryDTO);
  }


  ngOnDestroy() {
    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }

  onSearchChange(event: KeyboardEvent) {


    const searchText = (<HTMLInputElement>event.target).value.trim();

    if (Config.Client.Search.AutoComplete.enabled &&
      this.cache.lastAutocomplete !== searchText) {
      this.cache.lastAutocomplete = searchText;
      // this.autocomplete(searchText).catch(console.error);
    }

  }

  public setMouseOverAutoComplete(value: boolean) {
    this.mouseOverAutoComplete = value;
  }

  public onFocusLost() {
    if (this.mouseOverAutoComplete === false) {
      this.autoCompleteItems = [];
    }
  }

  public onFocus() {
    // TODO: implement autocomplete
    // this.autocomplete(this.searchText).catch(console.error);
  }

  public async openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
    document.body.style.paddingRight = '0px';
  }

  public hideModal() {
    this.modalRef.hide();
    this.modalRef = null;
  }

  resetQuery() {
    this.searchQueryDTO = <TextSearch>{text: '', type: SearchQueryTypes.any_text};
  }

  onQueryChange() {
    this.rawSearchText = SearchQueryDTO.stringify(this.searchQueryDTO);
  }

  validateRawSearchText() {
    try {
      this.searchQueryDTO = SearchQueryDTO.parse(this.rawSearchText);
      console.log(this.searchQueryDTO);
    } catch (e) {
      console.error(e);
    }
  }

  Search() {
    this.router.navigate(['/search', this.HTMLSearchQuery]).catch(console.error);
  }

  private emptyAutoComplete() {
    this.autoCompleteItems = [];
  }

  private async autocomplete(searchText: string) {
    if (!Config.Client.Search.AutoComplete.enabled) {
      return;
    }
    if (searchText.trim() === '.') {
      return;
    }


    if (searchText.trim().length > 0) {
      try {
        const items = await this._autoCompleteService.autoComplete(searchText);
        this.showSuggestions(items, searchText);
      } catch (error) {
        console.error(error);
      }

    } else {
      this.emptyAutoComplete();
    }
  }

  private showSuggestions(suggestions: AutoCompleteItem[], searchText: string) {
    this.emptyAutoComplete();
    suggestions.forEach((item: AutoCompleteItem) => {
      const renderItem = new AutoCompleteRenderItem(item.text, searchText, item.type);
      this.autoCompleteItems.push(renderItem);
    });
  }
}

class AutoCompleteRenderItem {
  public preText = '';
  public highLightText = '';
  public postText = '';
  public type: SearchQueryTypes;

  constructor(public text: string, searchText: string, type: SearchQueryTypes) {
    const preIndex = text.toLowerCase().indexOf(searchText.toLowerCase());
    if (preIndex > -1) {
      this.preText = text.substring(0, preIndex);
      this.highLightText = text.substring(preIndex, preIndex + searchText.length);
      this.postText = text.substring(preIndex + searchText.length);
    } else {
      this.postText = text;
    }
    this.type = type;
  }
}

