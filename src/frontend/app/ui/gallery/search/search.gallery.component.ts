import {Component, OnDestroy, TemplateRef} from '@angular/core';
import {AutoCompleteService} from './autocomplete.service';
import {ActivatedRoute, Params, Router, RouterLink} from '@angular/router';
import {GalleryService} from '../gallery.service';
import {Subscription} from 'rxjs';
import {NavigationService} from '../../../model/navigation.service';
import {QueryParams} from '../../../../../common/QueryParams';
import {MetadataSearchQueryTypes, SearchQueryDTO, SearchQueryTypes, TextSearch} from '../../../../../common/entities/SearchQueryDTO';
import {BsModalService} from 'ngx-bootstrap/modal';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {SearchQueryParserService} from './search-query-parser.service';

@Component({
  selector: 'app-gallery-search',
  templateUrl: './search.gallery.component.html',
  styleUrls: ['./search.gallery.component.css'],
  providers: [AutoCompleteService, RouterLink]
})
export class GallerySearchComponent implements OnDestroy {

  public searchQueryDTO: SearchQueryDTO = <TextSearch>{type: SearchQueryTypes.any_text, text: ''};
  public rawSearchText = '';
  mouseOverAutoComplete = false;
  readonly SearchQueryTypes: typeof SearchQueryTypes;
  modalRef: BsModalRef;
  public readonly MetadataSearchQueryTypes: { value: string; key: SearchQueryTypes }[];
  private readonly subscription: Subscription = null;

  constructor(private _autoCompleteService: AutoCompleteService,
              private _searchQueryParserService: SearchQueryParserService,
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
    this.rawSearchText = this._searchQueryParserService.stringify(this.searchQueryDTO);
    // this.validateRawSearchText();
  }

  validateRawSearchText() {
    try {
      this.searchQueryDTO = this._searchQueryParserService.parse(this.rawSearchText);
    } catch (e) {
      console.error(e);
    }
  }

  Search() {
    this.router.navigate(['/search', this.HTMLSearchQuery]).catch(console.error);
  }


}


