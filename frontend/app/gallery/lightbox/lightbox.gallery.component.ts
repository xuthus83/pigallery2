///<reference path="../../../browser.d.ts"/>

import {Component, Input, ElementRef, ViewChild, QueryList} from 'angular2/core';
import {Photo} from "../../../../common/entities/Photo";
import {Directory} from "../../../../common/entities/Directory";
import {Utils} from "../../../../common/Utils";
import {IRenderable, Dimension} from "../../model/IRenderable";
import {GalleryPhotoComponent} from "../photo/photo.gallery.component";
import {AnimationBuilder, CssAnimationBuilder} from "angular2/animate";
import {BrowserDomAdapter} from "angular2/src/platform/browser/browser_adapter";

@Component({
    selector: 'gallery-lightbox',
    styleUrls: ['app/gallery/lightbox/lightbox.gallery.component.css'],
    templateUrl: 'app/gallery/lightbox/lightbox.gallery.component.html'
})
export class GalleryLightboxComponent{

    @ViewChild('lightbox') lightBoxDiv:ElementRef;
    @ViewChild('blackCanvas') blackCanvasDiv:ElementRef;

    private activePhoto:GalleryPhotoComponent  = null;
    public gridPhotoQL:QueryList<GalleryPhotoComponent>;

    private dom:BrowserDomAdapter;
    private photoStyle = {width:"100%",height:"100%"};
    
    
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


        if(from.height > from.width){
            this.photoStyle.height = "100%";
            this.photoStyle.width = "auto";
        }else{
            this.photoStyle.height = "auto";
            this.photoStyle.width = "100%";
        }
        
        let anim0 = this.animBuilder.css();
        anim0.setDuration(0);
        anim0.setToStyles(from.toStyle());
        anim0.start(this.lightBoxDiv.nativeElement).onComplete(()=>{

            let anim1 = this.animBuilder.css();
            anim1.setDuration(800);
            anim1.setFromStyles(from.toStyle());
            anim1.setToStyles({height: "100%", width: "100%", "top":"0px","left": "0px"});
            anim1.start(this.lightBoxDiv.nativeElement);
        });

        let anim2 = this.animBuilder.css();
        anim2.setDuration(0);
        anim2.setToStyles({opacity:"0", display:"block"});
        anim2.start(this.blackCanvasDiv.nativeElement).onComplete(()=>{

            let anim3 = this.animBuilder.css();
            anim3.setDuration(800);
            anim3.setFromStyles({opacity:"0"});
            anim3.setToStyles({opacity:"1"});
            anim3.start(this.blackCanvasDiv.nativeElement);
        });
    }

    public hide() {
        console.log("hiding");
        let to = this.activePhoto.getDimension();
        to.top -= this.getBodyScrollTop();

        let anim0 = this.animBuilder.css();
        anim0.setDuration(800);
        anim0.setFromStyles({height: "100%", width: "100%", "top":"0px","left": "0px"});
        anim0.setToStyles(to.toStyle());
        anim0.start(this.lightBoxDiv.nativeElement).onComplete(()=>{
            let anim1 = this.animBuilder.css();
            anim1.setDuration(0);
            anim1.setToStyles({height: "0px", width: "0px", "top":"0px","left": "0px"});
            anim1.start(this.lightBoxDiv.nativeElement);
            this.dom.setStyle(this.dom.query('body'), 'overflow', 'auto');
        });


        let anim2 = this.animBuilder.css();
        anim2.setDuration(800);
        anim2.setFromStyles({opacity:"1"});
        anim2.setToStyles({opacity:"0"});
        anim2.start(this.blackCanvasDiv.nativeElement).onComplete(()=>{
            let anim4 = this.animBuilder.css();
            anim4.setDuration(0);
            anim4.setToStyles({opacity:"0", display:"none"});
            anim4.start(this.blackCanvasDiv.nativeElement);
        });
    }


    getPhotoPath(){
        if(!this.activePhoto){
            return "";
        }
        return Photo.getPhotoPath(this.activePhoto.directory,this.activePhoto.photo); 
    }

    getThumbnailPath(){
        if(!this.activePhoto){
            return "";
        }
        return Photo.getThumbnailPath(this.activePhoto.directory,this.activePhoto.photo);
    }
    
    private getBodyScrollTop(){
        return this.dom.getProperty(this.dom.query('body'),'scrollTop');
    }
    
}

