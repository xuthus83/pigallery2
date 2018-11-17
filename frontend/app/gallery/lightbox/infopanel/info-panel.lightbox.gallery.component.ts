import {Component, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {CameraMetadata, PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {Config} from '../../../../../common/config/public/Config';
import {MediaDTO} from '../../../../../common/entities/MediaDTO';

@Component({
  selector: 'app-info-panel',
  styleUrls: ['./info-panel.lightbox.gallery.component.css'],
  templateUrl: './info-panel.lightbox.gallery.component.html',
})
export class InfoPanelLightboxComponent {
  @Input() media: MediaDTO;
  @Output() closed = new EventEmitter();

  public mapEnabled = true;

  constructor(public elementRef: ElementRef) {
    this.mapEnabled = Config.Client.Map.enabled;
  }

  calcMpx() {
    return (this.media.metadata.size.width * this.media.metadata.size.height / 1000000).toFixed(2);
  }

  calcFileSize() {
    const postFixes = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;
    let size = this.media.metadata.fileSize;
    while (size > 1000 && index < postFixes.length - 1) {
      size /= 1000;
      index++;
    }
    return size.toFixed(2) + postFixes[index];
  }

  isThisYear() {
    return (new Date()).getFullYear() ===
      (new Date(this.media.metadata.creationDate)).getFullYear();
  }


  getTime() {
    const date = new Date(this.media.metadata.creationDate);
    return date.toTimeString().split(' ')[0];
  }


  toFraction(f) {
    if (f > 1) {
      return f;
    }
    return '1/' + (1 / f);
  }

  hasPositionData(): boolean {
    return MediaDTO.hasPositionData(this.media);
  }

  hasGPS() {
    return (<PhotoDTO>this.media).metadata.positionData && (<PhotoDTO>this.media).metadata.positionData.GPSData &&
      (<PhotoDTO>this.media).metadata.positionData.GPSData.latitude && (<PhotoDTO>this.media).metadata.positionData.GPSData.longitude;
  }

  getPositionText(): string {
    if (!(<PhotoDTO>this.media).metadata.positionData) {
      return '';
    }
    let str = (<PhotoDTO>this.media).metadata.positionData.city ||
      (<PhotoDTO>this.media).metadata.positionData.state || '';

    if (str.length !== 0) {
      str += ', ';
    }
    str += (<PhotoDTO>this.media).metadata.positionData.country || '';

    return str;
  }

  get CameraData(): CameraMetadata {
    return (<PhotoDTO>this.media).metadata.cameraData;
  }

  close() {
    this.closed.emit();
  }
}

