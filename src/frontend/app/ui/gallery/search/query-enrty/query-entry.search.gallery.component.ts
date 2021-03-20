import {Component, EventEmitter, forwardRef, OnChanges, Output} from '@angular/core';
import {
  DistanceSearch,
  ListSearchQueryTypes,
  OrientationSearch,
  RangeSearch,
  SearchListQuery,
  SearchQueryDTO,
  SearchQueryTypes,
  SomeOfSearchQuery,
  TextSearch,
  TextSearchQueryTypes
} from '../../../../../../common/entities/SearchQueryDTO';
import {Utils} from '../../../../../../common/Utils';
import {ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator} from '@angular/forms';


@Component({
  selector: 'app-gallery-search-query-entry',
  templateUrl: './query-entry.search.gallery.component.html',
  styleUrls: ['./query-entry.search.gallery.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GallerySearchQueryEntryComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GallerySearchQueryEntryComponent),
      multi: true
    }
  ]
})
export class GallerySearchQueryEntryComponent implements ControlValueAccessor, Validator, OnChanges {
  public queryEntry: SearchQueryDTO;
  public SearchQueryTypesEnum: { value: string; key: SearchQueryTypes }[];
  public SearchQueryTypes = SearchQueryTypes;
  @Output() delete = new EventEmitter<void>();

  constructor() {
    this.SearchQueryTypesEnum = Utils.enumToArray(SearchQueryTypes);
    // Range queries need to be added as AND with min and max sub entry
    this.SearchQueryTypesEnum =
      this.SearchQueryTypesEnum.filter(e => e.key !== SearchQueryTypes.UNKNOWN_RELATION);
  }

  get IsTextQuery(): boolean {
    return this.queryEntry && TextSearchQueryTypes.includes(this.queryEntry.type);
  }


  get IsListQuery(): boolean {
    return this.queryEntry && ListSearchQueryTypes.includes(this.queryEntry.type);
  }

  get AsListQuery(): SearchListQuery {
    return <any>this.queryEntry;
  }

  get AsRangeQuery(): RangeSearch {
    return <any>this.queryEntry;
  }


  get AsOrientationQuery(): OrientationSearch {
    return <any>this.queryEntry;
  }

  get AsDistanceQuery(): DistanceSearch {
    return <any>this.queryEntry;
  }


  get AsSomeOfQuery(): SomeOfSearchQuery {
    return <any>this.queryEntry;
  }

  get AsTextQuery(): TextSearch {
    return <any>this.queryEntry;
  }

  validate(control: FormControl): ValidationErrors {
    return {required: true};
  }

  addQuery(): void {
    if (!this.IsListQuery) {
      return;
    }
    this.AsListQuery.list.push(<TextSearch>{type: SearchQueryTypes.any_text, text: ''});
  }

  onChangeType() {
    if (this.IsListQuery) {
      delete this.AsTextQuery.text;
      this.AsListQuery.list = this.AsListQuery.list || [
        <TextSearch>{type: SearchQueryTypes.any_text, text: ''},
        <TextSearch>{type: SearchQueryTypes.any_text, text: ''}
      ];
    } else {
      delete this.AsListQuery.list;
    }
    if (this.queryEntry.type === SearchQueryTypes.distance) {
      this.AsDistanceQuery.from = {text: ''};
      this.AsDistanceQuery.distance = 1;
    } else {
      delete this.AsDistanceQuery.from;
      delete this.AsDistanceQuery.distance;
    }

    if (this.queryEntry.type === SearchQueryTypes.orientation) {
      this.AsOrientationQuery.landscape = true;
    } else {
      delete this.AsOrientationQuery.landscape;
    }
    this.onChange(this.queryEntry);
  }

  deleteItem() {
    this.delete.emit();
  }

  itemDeleted(i: number) {
    this.AsListQuery.list.splice(i, 1);
  }

  ngOnChanges(): void {
    // console.log('ngOnChanges', this.queryEntry);

  }

  public onTouched(): void {
  }

  public writeValue(obj: any): void {
    this.queryEntry = obj;
    //  console.log('write value', this.queryEntry);
    this.ngOnChanges();
  }

  registerOnChange(fn: (_: any) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.propagateTouch = fn;
  }

  public onChange(event: any) {
    this.propagateChange(this.queryEntry);
  }

  private propagateChange = (_: any) => {
  };

  private propagateTouch = (_: any) => {
  };
}

