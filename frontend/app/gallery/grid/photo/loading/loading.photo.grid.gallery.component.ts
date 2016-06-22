///<reference path="../../../../../browser.d.ts"/>

import {Component} from "@angular/core";

@Component({
    selector: 'gallery-grid-photo-loading',
    templateUrl: 'app/gallery/grid/photo/loading/loading.photo.grid.gallery.component.html',
    styleUrls: ['app/gallery/grid/photo/loading/loading.photo.grid.gallery.component.css'],
})
export class GalleryPhotoLoadingComponent {

    animate = false;

    startAnimation() {
        this.animate = true;
    }
}

