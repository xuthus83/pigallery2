import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Dimension, IRenderable} from "../../../model/IRenderable";
import {GridPhoto} from "../GridPhoto";
import {SearchTypes} from "../../../../../common/entities/AutoCompleteItem";
import {RouterLink} from "@angular/router";
import {Thumbnail, ThumbnailManagerService} from "../../thumnailManager.service";
import {Config} from "../../../../../common/config/public/Config";
import {AnimationBuilder} from "@angular/animations";
@Component({
  selector: 'gallery-grid-photo',
  templateUrl: './photo.grid.gallery.component.html',
  styleUrls: ['./photo.grid.gallery.component.css'],
  providers: [RouterLink]
})
export class GalleryPhotoComponent implements IRenderable, OnInit, OnDestroy {
  @Input() gridPhoto: GridPhoto;
  @ViewChild("img") imageRef: ElementRef;
  @ViewChild("info") infoDiv: ElementRef;
  @ViewChild("photoContainer") container: ElementRef;

  thumbnail: Thumbnail;
  /*
   image = {
   src: '',
   show: false
   };

   loading = {
   animate: false,
   show: true
   };
   */

  infoBar = {
    marginTop: 0,
    visible: false,
    background: "rgba(0,0,0,0.0)"
  };
  animationTimer = null;

  SearchTypes: any = [];
  searchEnabled: boolean = true;

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
  }


  isInView(): boolean {
    return document.body.scrollTop < this.container.nativeElement.offsetTop + this.container.nativeElement.clientHeight
      && document.body.scrollTop + window.innerHeight > this.container.nativeElement.offsetTop;
  }


  onScroll() {
    if (this.thumbnail.Available == true) {
      return;
    }
    let isInView = this.isInView();
    if (this.wasInView != isInView) {
      this.wasInView = isInView;
      this.thumbnail.Visible = isInView;
    }
  }

  getPositionText(): string {
    if (!this.gridPhoto) {
      return ""
    }
    return this.gridPhoto.photo.metadata.positionData.city ||
      this.gridPhoto.photo.metadata.positionData.state ||
      this.gridPhoto.photo.metadata.positionData.country;
  }


  hover() {
    this.infoBar.visible = true;
    if (this.animationTimer != null) {
      clearTimeout(this.animationTimer);
    }
    this.animationTimer = setTimeout(() => {
      this.infoBar.marginTop = -this.infoDiv.nativeElement.clientHeight;
      this.infoBar.background = "rgba(0,0,0,0.8)";
    }, 1);

  }

  mouseOut() {
    this.infoBar.marginTop = 0;
    this.infoBar.background = "rgba(0,0,0,0.0)";
    if (this.animationTimer != null) {
      clearTimeout(this.animationTimer);
    }
    this.animationTimer = setTimeout(() => {
      this.infoBar.visible = false;
    }, 500);

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

