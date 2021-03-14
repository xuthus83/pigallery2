import {Component, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {GalleryService} from '../gallery.service';
import {ContentWrapper} from '../../../../../common/entities/ConentWrapper';
import {Config} from '../../../../../common/config/public/Config';
import {NotificationService} from '../../../model/notification.service';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {BsModalService} from 'ngx-bootstrap/modal';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {NetworkService} from '../../../model/network/network.service';
import {Subscription} from 'rxjs';
import {SearchQueryDTO, SearchQueryTypes, TextSearch} from '../../../../../common/entities/SearchQueryDTO';
import {ActivatedRoute, Params} from '@angular/router';
import {QueryParams} from '../../../../../common/QueryParams';


@Component({
  selector: 'app-gallery-random-query-builder',
  templateUrl: './random-query-builder.gallery.component.html',
  styleUrls: ['./random-query-builder.gallery.component.css'],
})
export class RandomQueryBuilderGalleryComponent implements OnInit, OnDestroy {

  public searchQueryDTO: SearchQueryDTO;
  public rawSearchText: string;
  enabled = true;
  url = '';

  contentSubscription: Subscription = null;

  modalRef: BsModalRef;


  private readonly subscription: Subscription = null;

  constructor(public _galleryService: GalleryService,
              private  _notification: NotificationService,
              public i18n: I18n,
              private _route: ActivatedRoute,
              private modalService: BsModalService) {
    this.resetQuery();

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

  validateRawSearchText() {
    try {
      this.searchQueryDTO = SearchQueryDTO.parse(this.rawSearchText);
      this.url = NetworkService.buildUrl(Config.Client.publicUrl + '/api/gallery/random/' + this.HTMLSearchQuery);
      console.log(this.searchQueryDTO);
    } catch (e) {
      console.error(e);
    }
  }

  onQueryChange() {
    this.rawSearchText = SearchQueryDTO.stringify(this.searchQueryDTO);
    this.url = NetworkService.buildUrl(Config.Client.publicUrl + '/api/gallery/random/' + this.HTMLSearchQuery);
  }

  ngOnInit() {
    this.contentSubscription = this._galleryService.content.subscribe((content: ContentWrapper) => {
      this.enabled = !!content.directory;
      if (!this.enabled) {
        return;
      }
      // this.data.directory = Utils.concatUrls((<DirectoryDTO>content.directory).path, (<DirectoryDTO>content.directory).name);
    });
  }

  ngOnDestroy() {
    if (this.contentSubscription !== null) {
      this.contentSubscription.unsubscribe();
    }

    if (this.subscription !== null) {
      this.subscription.unsubscribe();
    }
  }


  openModal(template: TemplateRef<any>) {
    if (!this.enabled) {
      return;
    }
    if (this.modalRef) {
      this.modalRef.hide();
    }

    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
    document.body.style.paddingRight = '0px';
    this.onQueryChange();
    return false;
  }

  onCopy() {
    this._notification.success(this.i18n('Url has been copied to clipboard'));
  }

  public hideModal() {
    this.modalRef.hide();
    this.modalRef = null;
  }


  resetQuery() {
    this.searchQueryDTO = <TextSearch>{text: '', type: SearchQueryTypes.any_text};
  }


}
