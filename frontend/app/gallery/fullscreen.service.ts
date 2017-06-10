import {Injectable} from "@angular/core";
import {Event} from "../../../common/event/Event";

@Injectable()
export class FullScreenService {


  OnFullScreenChange = new Event<boolean>();

  public isFullScreenEnabled(): boolean {
    return !!(document.fullscreenElement || document['mozFullScreenElement'] || document.webkitFullscreenElement);
  }

  public showFullScreen(element: any) {
    if (this.isFullScreenEnabled()) {
      return;
    }

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
    this.OnFullScreenChange.trigger(true);
  }

  public exitFullScreen() {
    if (!this.isFullScreenEnabled()) {
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document['mozCancelFullScreen']) {
      document['mozCancelFullScreen']();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    this.OnFullScreenChange.trigger(false);
  }

}
