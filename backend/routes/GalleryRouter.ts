///<reference path="../../typings/main.d.ts"/>

import {AuthenticationMWs} from "../middlewares/AuthenticationMWs";
import {GalleryMWs} from "../middlewares/GalleryMWs";

export class GalleryRouter{
    constructor(private app){

        this.addDirectoryList();
        this.addGetImageThumbnail();
        this.addGetImage();

        this.addSearch();
        this.addAutoComplete();
    }

    private addDirectoryList() {
        this.app.get(["/api/gallery/:directory","/api/gallery/"],
            AuthenticationMWs.authenticate,
            GalleryMWs.listDirectory
        );
    };


    private addGetImage() {
        this.app.get(["/api/gallery/:directory/:image","/api/gallery/:image"],
            AuthenticationMWs.authenticate,
            GalleryMWs.renderImage
        );
    };

    private addGetImageThumbnail() {
        this.app.get("/api/gallery/:directory/:image/thumbnail",
            AuthenticationMWs.authenticate,
            GalleryMWs.renderThumbnail
        );
    };

    private addSearch() {
        this.app.get("/api/gallery/search",
            AuthenticationMWs.authenticate,
            GalleryMWs.search
        );
    };

    private addAutoComplete() {
        this.app.get("/api/gallery/autocomplete",
            AuthenticationMWs.authenticate,
            GalleryMWs.autocomplete
        );
    };



}