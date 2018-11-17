import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Dimension, IRenderable} from '../../../model/IRenderable';
import {GridMedia} from '../GridMedia';
import {SearchTypes} from '../../../../../common/entities/AutoCompleteItem';
import {RouterLink} from '@angular/router';
import {Thumbnail, ThumbnailManagerService} from '../../thumnailManager.service';
import {Config} from '../../../../../common/config/public/Config';
import {AnimationBuilder} from '@angular/animations';
import {PageHelper} from '../../../model/page.helper';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';

@Component({
  selector: 'app-gallery-grid-photo',
  templateUrl: './photo.grid.gallery.component.html',
  styleUrls: ['./photo.grid.gallery.component.css'],
  providers: [RouterLink]
})
export class GalleryPhotoComponent implements IRenderable, OnInit, OnDestroy {
  @Input() gridPhoto: GridMedia;
  @ViewChild('img') imageRef: ElementRef;
  @ViewChild('info') infoDiv: ElementRef;
  @ViewChild('photoContainer') container: ElementRef;

  thumbnail: Thumbnail;
  infoBar = {
    marginTop: 0,
    visible: false,
    background: 'rgba(0,0,0,0.0)'
  };
  animationTimer = null;

  SearchTypes: any = [];
  searchEnabled = true;

  wasInView: boolean = null;

  constructor(private thumbnailService: ThumbnailManagerService,
              private _animationBuilder: AnimationBuilder) {
    this.SearchTypes = SearchTypes;
    this.searchEnabled = Config.Client.Search.enabled;
  }

  ngOnInit() {
    this.thumbnail = this.thumbnailService.getThumbnail(this.gridPhoto);
  }


  ngOnDestroy() {
    this.thumbnail.destroy();

    if (this.animationTimer != null) {
      clearTimeout(this.animationTimer);
    }
  }


  isInView(): boolean {
    return PageHelper.ScrollY < this.container.nativeElement.offsetTop + this.container.nativeElement.clientHeight
      && PageHelper.ScrollY + window.innerHeight > this.container.nativeElement.offsetTop;
  }

  get ScrollListener(): boolean {
    return !this.thumbnail.Available && !this.thumbnail.Error;
  }

  onScroll() {
    if (this.thumbnail.Available === true || this.thumbnail.Error === true) {
      return;
    }
    const isInView = this.isInView();
    if (this.wasInView !== isInView) {
      this.wasInView = isInView;
      this.thumbnail.Visible = isInView;
    }
  }


  getPositionText(): string {
    if (!this.gridPhoto || !this.gridPhoto.isPhoto()) {
      return '';
    }
    return (<PhotoDTO>this.gridPhoto.media).metadata.positionData.city ||
      (<PhotoDTO>this.gridPhoto.media).metadata.positionData.state ||
      (<PhotoDTO>this.gridPhoto.media).metadata.positionData.country;
  }


  mouseOver() {
    this.infoBar.visible = true;
    if (this.animationTimer != null) {
      clearTimeout(this.animationTimer);
    }
    this.animationTimer = setTimeout(() => {
      this.infoBar.background = 'rgba(0,0,0,0.8)';
      if (!this.infoDiv) {
        this.animationTimer = setTimeout(() => {
          if (!this.infoDiv) {
            this.infoBar.marginTop = -50;
            return;
          }
          this.infoBar.marginTop = -this.infoDiv.nativeElement.clientHeight;
        }, 10);
        return;
      }
      this.infoBar.marginTop = -this.infoDiv.nativeElement.clientHeight;
    }, 1);

  }

  mouseOut() {
    if (this.animationTimer != null) {
      clearTimeout(this.animationTimer);
    }
    this.animationTimer = setTimeout(() => {
      this.infoBar.marginTop = 0;
      this.infoBar.background = 'rgba(0,0,0,0.0)';
      if (this.animationTimer != null) {
        clearTimeout(this.animationTimer);
      }
      this.animationTimer = setTimeout(() => {
        this.infoBar.visible = false;
      }, 500);
    }, 100);

  }

  /*
   onImageLoad() {
   this.loading.show = false;
   }
   */
  public getDimension(): Dimension {
    if (!this.imageRef) {
      return <Dimension>{
        top: 0,
        left: 0,
        width: 0,
        height: 0
      };
    }

    return <Dimension>{
      top: this.imageRef.nativeElement.offsetTop,
      left: this.imageRef.nativeElement.offsetLeft,
      width: this.imageRef.nativeElement.width,
      height: this.imageRef.nativeElement.height
    };
  }

}

