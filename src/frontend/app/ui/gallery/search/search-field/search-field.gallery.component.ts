import {Component, ElementRef, EventEmitter, forwardRef, OnDestroy, Output, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {BehaviorSubject, Subscription} from 'rxjs';
import {AutoCompleteService, RenderableAutoCompleteItem} from '../autocomplete.service';
import {MetadataSearchQueryTypes, SearchQueryTypes} from '../../../../../../common/entities/SearchQueryDTO';
import {SearchQueryParserService} from '../search-query-parser.service';
import {GalleryService} from '../../gallery.service';
import {NavigationService} from '../../../../model/navigation.service';
import {Config} from '../../../../../../common/config/public/Config';
import {ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator} from '@angular/forms';

@Component({
  selector: 'app-gallery-search-field',
  templateUrl: './search-field.gallery.component.html',
  styleUrls: ['./search-field.gallery.component.css'],
  providers: [
    AutoCompleteService, RouterLink,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GallerySearchFieldComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GallerySearchFieldComponent),
      multi: true
    }
  ]
})
export class GallerySearchFieldComponent implements ControlValueAccessor, Validator, OnDestroy {

  @ViewChild('SearchField', {static: false}) searchField: ElementRef;
  @ViewChild('SearchHintField', {static: false}) searchHintField: ElementRef;
  @Output() search = new EventEmitter<void>();

  autoCompleteRenders: AutoCompleteRenderItem[] = [];
  public rawSearchText = '';
  mouseOverAutoComplete = false;
  readonly SearchQueryTypes: typeof SearchQueryTypes;
  public readonly MetadataSearchQueryTypes: { value: string; key: SearchQueryTypes }[];
  public highlightedAutoCompleteItem = -1;
  private cache = {
    lastAutocomplete: '',
    lastInstantSearch: ''
  };
  private autoCompleteItemsSubscription: Subscription = null;
  private autoCompleteItems: BehaviorSubject<RenderableAutoCompleteItem[]>;

  constructor(private _autoCompleteService: AutoCompleteService,
              private _searchQueryParserService: SearchQueryParserService,
              private _galleryService: GalleryService,
              private navigationService: NavigationService,
              private _route: ActivatedRoute,
              public router: Router) {

    this.SearchQueryTypes = SearchQueryTypes;
    this.MetadataSearchQueryTypes = MetadataSearchQueryTypes.map(v => ({key: v, value: SearchQueryTypes[v]}));

  }

  get SearchHint() {
    if (!this.rawSearchText) {
      return '';
    }
    if (!this.autoCompleteItems ||
      !this.autoCompleteItems.value || this.autoCompleteItems.value.length === 0) {
      return this.rawSearchText;
    }
    const itemIndex = this.highlightedAutoCompleteItem < 0 ? 0 : this.highlightedAutoCompleteItem;
    const searchText = this.getAutocompleteToken();
    if (searchText.current === '') {
      return this.rawSearchText + this.autoCompleteItems.value[itemIndex].queryHint;
    }
    if (this.autoCompleteItems.value[0].queryHint.startsWith(searchText.current)) {
      return this.rawSearchText + this.autoCompleteItems
        .value[itemIndex].queryHint.substr(searchText.current.length);
    }
    return this.rawSearchText;
  }


  ngOnDestroy() {
    if (this.autoCompleteItemsSubscription) {
      this.autoCompleteItemsSubscription.unsubscribe();
      this.autoCompleteItemsSubscription = null;
    }
  }

  getAutocompleteToken(): { current: string, prev: string } {
    if (this.rawSearchText.trim().length === 0) {
      return {current: '', prev: ''};
    }
    const tokens = this.rawSearchText.split(' ');
    return {
      current: tokens[tokens.length - 1],
      prev: (tokens.length > 2 ? tokens[tokens.length - 2] : '')
    };

  }

  onSearchChange(event: KeyboardEvent) {
    const searchText = this.getAutocompleteToken();
    if (Config.Client.Search.AutoComplete.enabled &&
      this.cache.lastAutocomplete !== searchText.current) {
      this.cache.lastAutocomplete = searchText.current;
      this.autocomplete(searchText).catch(console.error);
    }

  }

  public setMouseOverAutoComplete(value: boolean) {
    this.mouseOverAutoComplete = value;
  }

  public onFocusLost() {
    if (this.mouseOverAutoComplete === false) {
      this.autoCompleteRenders = [];
    }
  }

  public onFocus() {
    // TODO: implement autocomplete
    // this.autocomplete(this.searchText).catch(console.error);
  }


  applyHint($event: any) {
    if ($event.target.selectionStart !== this.rawSearchText.length) {
      return;
    }
    this.rawSearchText = this.SearchHint;
    this.onChange();
  }

  applyAutoComplete(item: AutoCompleteRenderItem) {
    const token = this.getAutocompleteToken();
    this.rawSearchText = this.rawSearchText.substr(0, this.rawSearchText.length - token.current.length)
      + item.queryHint;
    this.onChange();
    this.emptyAutoComplete();
  }

  setMouseOverAutoCompleteItem(i: number) {
    this.highlightedAutoCompleteItem = i;
  }

  selectAutocompleteUp() {
    if (this.highlightedAutoCompleteItem > 0) {
      this.highlightedAutoCompleteItem--;
    }
  }

  selectAutocompleteDown() {
    if (this.autoCompleteItems &&
      this.highlightedAutoCompleteItem < this.autoCompleteItems.value.length - 1) {
      this.highlightedAutoCompleteItem++;
    }
  }

  OnEnter($event: any) {
    if (this.autoCompleteRenders.length === 0 || this.highlightedAutoCompleteItem === -1) {
      this.search.emit();
      return;
    }
    this.applyAutoComplete(this.autoCompleteRenders[this.highlightedAutoCompleteItem]);
  }

  public onTouched(): void {
  }

  public writeValue(obj: any): void {
    this.rawSearchText = obj;
  }

  registerOnChange(fn: (_: any) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.propagateTouch = fn;
  }

  public onChange() {
    this.propagateChange(this.rawSearchText);
  }

  validate(control: FormControl): ValidationErrors {
    return {required: true};
  }

  Scrolled() {
    this.searchHintField.nativeElement.scrollLeft = this.searchField.nativeElement.scrollLeft;
  }

  private emptyAutoComplete() {
    this.highlightedAutoCompleteItem = -1;
    this.autoCompleteRenders = [];
  }

  private async autocomplete(searchText: { current: string, prev: string }) {
    if (!Config.Client.Search.AutoComplete.enabled) {
      return;
    }

    if (this.rawSearchText.trim().length > 0) { // are we searching for anything?
      try {
        if (this.autoCompleteItems) {
          this.autoCompleteItems.unsubscribe();
        }
        this.autoCompleteItems = this._autoCompleteService.autoComplete(searchText);
        this.autoCompleteItemsSubscription = this.autoCompleteItems.subscribe(() => {
          this.showSuggestions(this.autoCompleteItems.value, searchText.current);
        });
      } catch (error) {
        console.error(error);
      }

    } else {
      this.emptyAutoComplete();
    }
  }

  private showSuggestions(suggestions: RenderableAutoCompleteItem[], searchText: string) {
    this.emptyAutoComplete();
    suggestions.forEach((item: RenderableAutoCompleteItem) => {
      const renderItem = new AutoCompleteRenderItem(item.text, searchText, item.type, item.queryHint);
      this.autoCompleteRenders.push(renderItem);
    });
  }

  private propagateChange = (_: any) => {
  };

  private propagateTouch = (_: any) => {
  };
}

class AutoCompleteRenderItem {
  public preText = '';
  public highLightText = '';
  public postText = '';
  public type: SearchQueryTypes;
  public queryHint: string;

  constructor(public text: string, searchText: string, type: SearchQueryTypes, queryHint: string) {
    const preIndex = text.toLowerCase().indexOf(searchText.toLowerCase());
    if (preIndex > -1) {
      this.preText = text.substring(0, preIndex);
      this.highLightText = text.substring(preIndex, preIndex + searchText.length);
      this.postText = text.substring(preIndex + searchText.length);
    } else {
      this.postText = text;
    }
    this.type = type;
    this.queryHint = queryHint;
  }
}

