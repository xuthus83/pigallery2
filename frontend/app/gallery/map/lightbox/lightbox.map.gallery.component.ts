import {Component, ElementRef, HostListener, Input, OnChanges, ViewChild} from "@angular/core";
import {PhotoDTO} from "../../../../../common/entities/PhotoDTO";
import {Dimension} from "../../../model/IRenderable";
import {FullScreenService} from "../../fullscreen.service";
import {SebmGoogleMap} from "angular2-google-maps/core";
import {IconThumbnail, ThumbnailManagerService} from "../../thumnailManager.service";
import {IconPhoto} from "../../IconPhoto";

@Component({
    selector: 'gallery-map-lightbox',
    styleUrls: ['app/gallery/map/lightbox/lightbox.map.gallery.component.css'],
    templateUrl: 'app/gallery/map/lightbox/lightbox.map.gallery.component.html',
})
export class GalleryMapLightboxComponent implements OnChanges {

    @Input() photos: Array<PhotoDTO>;
    private startPosition = null;
    public lightboxDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
    public mapDimension: Dimension = <Dimension>{top: 0, left: 0, width: 0, height: 0};
    private visible = false;
    private opacity = 1.0;
    mapPhotos: Array<{latitude: number, longitude: number, iconUrl?: string, thumbnail: IconThumbnail}> = [];
    mapCenter = {latitude: 0, longitude: 0};

    @ViewChild("root") elementRef: ElementRef;

    @ViewChild(SebmGoogleMap) map: SebmGoogleMap;


    constructor(private fullScreenService: FullScreenService, private thumbnailService: ThumbnailManagerService) {


    }

//TODO: fix zooming
    ngOnChanges() {
        if (this.visible == false) {
            return;
        }
        this.showImages();
    }

    public show(position: Dimension) {
        this.visible = true;
        this.opacity = 1.0;
        this.startPosition = position;
        this.lightboxDimension = position;
        this.lightboxDimension.top -= this.getBodyScrollTop();
        this.mapDimension = <Dimension>{
            top: 0,
            left: 0,
            width: this.getScreenWidth(),
            height: this.getScreenHeight()
        };
        this.map.triggerResize();

        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
        this.showImages();

        setImmediate(() => {
            this.lightboxDimension = <Dimension>{
                top: 0,
                left: 0,
                width: this.getScreenWidth(),
                height: this.getScreenHeight()
            };
        });
    }

    public hide() {
        this.fullScreenService.exitFullScreen();
        let to = this.startPosition;

        //iff target image out of screen -> scroll to there
        if (this.getBodyScrollTop() > to.top || this.getBodyScrollTop() + this.getScreenHeight() < to.top) {
            this.setBodyScrollTop(to.top);
        }

        this.lightboxDimension = this.startPosition;
        this.lightboxDimension.top -= this.getBodyScrollTop();
        document.getElementsByTagName('body')[0].style.overflow = 'scroll';
        this.opacity = 0.0;
        setTimeout(() => {
            this.visible = false;
            this.hideImages();
        }, 500);


    }

    showImages() {
        this.hideImages();

        this.mapPhotos = this.photos.filter(p => {
            return p.metadata && p.metadata.positionData && p.metadata.positionData.GPSData;
        }).map(p => {
            let th = this.thumbnailService.getIcon(new IconPhoto(p));
            let obj: {latitude: number, longitude: number, iconUrl?: string, thumbnail: IconThumbnail} = {
                latitude: p.metadata.positionData.GPSData.latitude,
                longitude: p.metadata.positionData.GPSData.longitude,
                thumbnail: th

            };
            if (th.Available == true) {
                obj.iconUrl = th.Src;
            } else {
                th.OnLoad = () => {
                    obj.iconUrl = th.Src;
                };
            }
            return obj;
        });

        if (this.mapPhotos.length > 0) {
            this.mapCenter = this.mapPhotos[0];
        }
    }

    hideImages() {
        this.mapPhotos.forEach(mp => mp.thumbnail.destroy());
        this.mapPhotos = [];
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

    //noinspection JSUnusedGlobalSymbols
    @HostListener('window:keydown', ['$event'])
    onKeyPress(e: KeyboardEvent) {
        if (this.visible != true) {
            return;
        }
        let event: KeyboardEvent = window.event ? <any>window.event : e;
        switch (event.keyCode) {
            case 27: //escape
                this.hide();
                break;
        }
    }


}

