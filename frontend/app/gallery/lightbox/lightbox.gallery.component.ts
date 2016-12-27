import {Component, QueryList, Output, EventEmitter, HostListener, ElementRef, ViewChild} from "@angular/core";
import {PhotoDTO} from "../../../../common/entities/PhotoDTO";
import {GalleryPhotoComponent} from "../grid/photo/photo.grid.gallery.component";
import {Dimension} from "../../model/IRenderable";
import {FullScreenService} from "../fullscreen.service";

@Component({
    selector: 'gallery-lightbox',
    styleUrls: ['app/gallery/lightbox/lightbox.gallery.component.css'],
    templateUrl: 'app/gallery/lightbox/lightbox.gallery.component.html',
})
export class GalleryLightboxComponent {
    @Output('onLastElement') onLastElement = new EventEmitter();

    public navigation = {hasPrev: true, hasNext: true};
    public photoDimension: Dimension = new Dimension(0, 0, 0, 0);

    private activePhoto: GalleryPhotoComponent;
    public gridPhotoQL: QueryList<GalleryPhotoComponent>;

    private visible = false;

    @ViewChild("root") elementRef: ElementRef;


    constructor(private fullScreenService: FullScreenService) {


    }

    public nextImage() {

        let pcList = this.gridPhotoQL.toArray();
        for (let i = 0; i < pcList.length; i++) {
            if (pcList[i] === this.activePhoto) {
                if (i + 1 < pcList.length) {
                    this.showPhoto(pcList[i + 1]);

                    if (i + 3 === pcList.length) {
                        this.onLastElement.emit({}); //trigger to render more photos if there are
                    }
                }
                return;
            }
        }
    }

    public prevImage() {
        let pcList = this.gridPhotoQL.toArray();
        for (let i = 0; i < pcList.length; i++) {
            if (pcList[i] === this.activePhoto) {
                if (i > 0) {
                    this.showPhoto(pcList[i - 1]);
                }
                return;
            }
        }
    }


    private showPhoto(photoComponent: GalleryPhotoComponent) {
        this.activePhoto = null;
        setImmediate(() => {
            let pcList = this.gridPhotoQL.toArray();

            let index = pcList.indexOf(photoComponent);
            if (index == -1) {
                throw new Error("Can't find the photo");
            }

            this.photoDimension = this.calcLightBoxPhotoDimension(photoComponent.gridPhoto.photo);
            this.navigation.hasPrev = index > 0;
            this.navigation.hasNext = index + 1 < pcList.length;
            this.activePhoto = photoComponent;
        });
    }

    public show(photo: PhotoDTO) {
        this.visible = true;
        let selectedPhoto = this.findPhotoComponent(photo);
        if (selectedPhoto === null) {
            throw new Error("Can't find PhotoDTO");
        }


        this.showPhoto(selectedPhoto);
        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
    }

    public hide() {
        this.fullScreenService.exitFullScreen();
        this.visible = false;
        let to = this.activePhoto.getDimension();

        //iff target image out of screen -> scroll to there
        if (this.getBodyScrollTop() > to.top || this.getBodyScrollTop() + this.getScreenHeight() < to.top) {
            this.setBodyScrollTop(to.top);
        }

        document.getElementsByTagName('body')[0].style.overflow = 'auto';
        this.activePhoto = null;


    }


    private findPhotoComponent(photo: any) {
        let galleryPhotoComponents = this.gridPhotoQL.toArray();
        for (let i = 0; i < galleryPhotoComponents.length; i++) {
            if (galleryPhotoComponents[i].gridPhoto.photo == photo) {
                return galleryPhotoComponents[i];
            }
        }
        return null;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyPress(e: KeyboardEvent) {
        let event: KeyboardEvent = window.event ? <any>window.event : e;
        switch (event.keyCode) {
            case 37:
                this.prevImage();
                break;
            case 39:
                this.nextImage();
                break;
        }
    }

    private getBodyScrollTop(): number {
        return window.scrollY;
    }

    private setBodyScrollTop(value: number) {
        window.scrollTo(window.scrollX, value);
    }

    private getScreenWidth() {
        return window.innerWidth;
    }

    private getScreenHeight() {
        return window.innerHeight;
    }


    private calcLightBoxPhotoDimension(photo: PhotoDTO): Dimension {
        let width = 0;
        let height = 0;
        if (photo.metadata.size.height > photo.metadata.size.width) {
            width = Math.round(photo.metadata.size.width * (this.getScreenHeight() / photo.metadata.size.height));
            height = this.getScreenHeight();
        } else {
            width = this.getScreenWidth();
            height = Math.round(photo.metadata.size.height * (this.getScreenWidth() / photo.metadata.size.width));
        }
        let top = (this.getScreenHeight() / 2 - height / 2);
        let left = (this.getScreenWidth() / 2 - width / 2);

        return new Dimension(top, left, width, height);
    }
}

