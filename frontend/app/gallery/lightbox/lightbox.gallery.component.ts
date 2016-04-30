///<reference path="../../../browser.d.ts"/>

import {Component, Input, ElementRef, ViewChild, QueryList} from 'angular2/core';
import {Photo} from "../../../../common/entities/Photo";
import {Directory} from "../../../../common/entities/Directory";
import {Utils} from "../../../../common/Utils";
import {IRenderable, Dimension} from "../../model/IRenderable";
import {GalleryPhotoComponent} from "../photo/photo.gallery.component";
import {AnimationBuilder} from "angular2/animate";
import {BrowserDomAdapter} from "angular2/src/platform/browser/browser_adapter";

@Component({
    selector: 'gallery-lightbox',
    styleUrls: ['app/gallery/lightbox/lightbox.gallery.component.css'],
    templateUrl: 'app/gallery/lightbox/lightbox.gallery.component.html'
})
export class GalleryLightboxComponent{

    @ViewChild('lightbox') lightBoxDiv:ElementRef;

    private activePhoto:GalleryPhotoComponent  = null;
    public gridPhotoQL:QueryList<GalleryPhotoComponent>;


    dom:BrowserDomAdapter;
    
    constructor(private animBuilder: AnimationBuilder) {
        this.dom = new BrowserDomAdapter();
    }

    public show(photo:Photo){
        let galleryPhotoComponents = this.gridPhotoQL.toArray();
        let selectedPhoto:GalleryPhotoComponent = null;
        for(let i= 0; i < galleryPhotoComponents.length; i++){
            if(galleryPhotoComponents[i].photo == photo){
                selectedPhoto = galleryPhotoComponents[i];
                break;
            }
        }
        if(selectedPhoto === null){
            throw new Error("Can't find Photo");
        }

        this.dom.setStyle(this.dom.query('body'), 'overflow', 'hidden');
        this.activePhoto = selectedPhoto;


        let from = this.activePhoto.getDimension();
        from.top -= this.getBodyScrollTop();
        console.log(from);
        let animation0 = this.animBuilder.css();
        animation0.setDuration(0);
        animation0.setToStyles(from.toStyle());
        animation0.start(this.lightBoxDiv.nativeElement).onComplete(()=>{

            let animation = this.animBuilder.css();
            animation.setDuration(800);
            animation.setFromStyles(from.toStyle());
            animation.setToStyles({height: "100%", width: "100%", "top":"0px","left": "0px"});
            animation.start(this.lightBoxDiv.nativeElement);
        });
    }

    public hide() {
        console.log("hiding");
        let to = this.activePhoto.getDimension();
        to.top -= this.getBodyScrollTop();

        let animation = this.animBuilder.css();
        animation.setDuration(800);
        animation.setFromStyles({height: "100%", width: "100%", "top":"0px","left": "0px"});
        animation.setToStyles(to.toStyle());
        animation.start(this.lightBoxDiv.nativeElement).onComplete(()=>{
            let animation2 = this.animBuilder.css();
            animation2.setDuration(0);
            animation2.setToStyles({height: "0px", width: "0px", "top":"0px","left": "0px"});
            animation2.start(this.lightBoxDiv.nativeElement);
            this.dom.setStyle(this.dom.query('body'), 'overflow', 'auto');
        });
    }
    
    private getBodyScrollTop(){
        return this.dom.getProperty(this.dom.query('body'),'scrollTop');
    }
    
}

