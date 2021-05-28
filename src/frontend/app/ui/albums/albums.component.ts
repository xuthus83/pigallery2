import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AlbumsService} from './albums.service';
import {BsModalService} from 'ngx-bootstrap/modal';
import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {SearchQueryTypes, TextSearch} from '../../../../common/entities/SearchQueryDTO';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})
export class AlbumsComponent implements OnInit {
  @ViewChild('container', {static: true}) container: ElementRef;
  public size: number;
  public savedSearch = {
    name: '',
    searchQuery: {type: SearchQueryTypes.any_text, text: ''} as TextSearch
  };
  private modalRef: BsModalRef;

  constructor(public albumsService: AlbumsService,
              private modalService: BsModalService) {
    this.albumsService.getAlbums().catch(console.error);
  }


  ngOnInit(): void {
    this.updateSize();
  }


  public async openModal(template: TemplateRef<any>): Promise<void> {
    this.modalRef = this.modalService.show(template, {class: 'modal-lg'});
    document.body.style.paddingRight = '0px';
  }

  public hideModal(): void {
    this.modalRef.hide();
    this.modalRef = null;
  }

  async saveSearch(): Promise<void> {
    await this.albumsService.addSavedSearch(this.savedSearch.name, this.savedSearch.searchQuery);
    this.hideModal();
  }

  private updateSize(): void {
    const size = 220 + 5;
    // body - container margin
    const containerWidth = this.container.nativeElement.clientWidth - 30;
    this.size = (containerWidth / Math.round((containerWidth / size))) - 5;
  }


}

