///<reference path="../../browser.d.ts"/>

import {Injectable} from "@angular/core";

@Injectable()
export class FullScreenService {


    public isFullScreenEnabled():boolean {
        return !!(document.fullscreenElement || document['mozFullScreenElement'] || document.webkitFullscreenElement);
    }

    public showFullScreen(element:any) {
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
    }

}
