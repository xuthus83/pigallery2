import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AlbumsService} from './albums.service';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.css']
})
export class AlbumsComponent implements OnInit {
  @ViewChild('container', {static: true}) container: ElementRef;
  public size: number;


  constructor(public albumsService: AlbumsService) {
    this.albumsService.getAlbums().catch(console.error);
  }


  ngOnInit(): void {
    this.updateSize();
  }

  private updateSize(): void {
    const size = 220 + 5;
    // body - container margin
    const containerWidth = this.container.nativeElement.clientWidth - 30;
    this.size = (containerWidth / Math.round((containerWidth / size))) - 5;
  }


}

