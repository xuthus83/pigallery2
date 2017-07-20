import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";
import {DirectoryDTO} from "../../../../common/entities/DirectoryDTO";
import {RouterLink} from "@angular/router";
import {Utils} from "../../../../common/Utils";
import {Photo} from "../Photo";
import {Thumbnail, ThumbnailManagerService} from "../thumnailManager.service";
import {ShareService} from "../share.service";

@Component({
  selector: 'gallery-directory',
  templateUrl: './directory.gallery.component.html',
  styleUrls: ['./directory.gallery.component.css'],
  providers: [RouterLink],
})
export class GalleryDirectoryComponent implements OnInit, OnDestroy {
  @Input() directory: DirectoryDTO;
  @ViewChild("dirContainer") container: ElementRef;
  thumbnail: Thumbnail = null;

  constructor(private thumbnailService: ThumbnailManagerService,
              private _sanitizer: DomSanitizer,
              public _shareService: ShareService) {

  }

  size: number = null;

  getSanitizedThUrl() {
    return this._sanitizer.bypassSecurityTrustStyle('url(' + encodeURI(this.thumbnail.Src).replace(/\(/g, "%28").replace(/\)/g, "%29") + ')');
  }

  //TODO: implement scroll
  isInView(): boolean {
    return document.body.scrollTop < this.container.nativeElement.offsetTop + this.container.nativeElement.clientHeight
      && document.body.scrollTop + window.innerHeight > this.container.nativeElement.offsetTop;
  }

  getDirectoryPath() {
    return Utils.concatUrls(this.directory.path, this.directory.name);
  }

  ngOnDestroy() {
    if (this.thumbnail != null) {
      this.thumbnail.destroy();
    }
  }

  ngOnInit() {
    if (this.directory.photos.length > 0) {
      this.thumbnail = this.thumbnailService.getThumbnail(new Photo(this.directory.photos[0], this.calcSize(), this.calcSize()));
    }
  }

  calcSize() {
    if (this.size == null ||
      document.getElementsByTagName('body')[0].style.overflowY == 'scroll') {
      let size = 220 + 5;
      const containerWidth = this.container.nativeElement.parentElement.parentElement.clientWidth;
      this.size = containerWidth / Math.round((containerWidth / size));
    }
    return Math.floor(this.size - 5);
  }

}

