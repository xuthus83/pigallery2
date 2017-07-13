import {Component, ElementRef, Input} from "@angular/core";
import {PhotoDTO} from "../../../../../common/entities/PhotoDTO";
import {Config} from "../../../../../common/config/public/Config";

@Component({
  selector: 'info-panel',
  styleUrls: ['./info-panel.lightbox.gallery.component.css'],
  templateUrl: './info-panel.lightbox.gallery.component.html',
})
export class InfoPanelLightboxComponent {
  @Input() photo: PhotoDTO;

  public mapEnabled = true;

  constructor(public elementRef: ElementRef) {
    this.mapEnabled = Config.Client.Map.enabled;
  }

  calcMpx() {
    return (this.photo.metadata.size.width * this.photo.metadata.size.height / 1000000).toFixed(2);
  }

  calcFileSize() {
    let postFixes = ["B", "KB", "MB", "GB", "TB"];
    let index = 0;
    let size = this.photo.metadata.fileSize;
    while (size > 1000 && index < postFixes.length - 1) {
      size /= 1000;
      index++;
    }
    return size.toFixed(2) + postFixes[index];
  }

  getCurrentYear() {
    return (new Date()).getFullYear();
  }

  getYear() {
    const date = new Date(this.photo.metadata.creationDate);
    return date.getFullYear();
  }

  getDate() {
    const date = new Date(this.photo.metadata.creationDate);
    let locale = "en-us";
    return date.toLocaleString(locale, {month: "long"}) + " " + date.getDate();
  }

  getTime() {
    const date = new Date(this.photo.metadata.creationDate);
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  }

  getDay() {
    const date = new Date(this.photo.metadata.creationDate);
    let locale = "en-us";
    return date.toLocaleString(locale, {weekday: "long"});
  }

  toFraction(f) {
    if (f > 1) {
      return f;
    }
    return "1/" + (1 / f);
  }

  hasGPS() {
    return this.photo.metadata.positionData && this.photo.metadata.positionData.GPSData &&
      this.photo.metadata.positionData.GPSData.latitude && this.photo.metadata.positionData.GPSData.longitude
  }

  getPositionText(): string {
    if (!this.photo.metadata.positionData) {
      return "";
    }
    let str = this.photo.metadata.positionData.city ||
      this.photo.metadata.positionData.state;

    if (str.length != 0) {
      str += ", ";
    }
    str += this.photo.metadata.positionData.country;

    return str;
  }
}

