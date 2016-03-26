///<reference path="../../typings/main.d.ts"/>

import {AuthenticationMWs} from "../middlewares/AuthenticationMWs";
import {GalleryMWs} from "../middlewares/GalleryMWs";
import {RenderingMWs} from "../middlewares/RenderingMWs";

export class GalleryRouter{
    constructor(private app){

        this.addDirectoryList();
        this.addGetImageThumbnail();
        this.addGetImage();

        this.addSearch();
        this.addAutoComplete();
    }

    private addDirectoryList() {
        this.app.get(["/api/gallery/:directory","/api/gallery/","/api/gallery//"],
            AuthenticationMWs.authenticate,
            GalleryMWs.listDirectory,
            RenderingMWs.renderResult
        );
    };


    private addGetImage() {
        this.app.get(["/api/gallery/:directory/:image","/api/gallery/:image"],
            AuthenticationMWs.authenticate,
            GalleryMWs.loadImage,
            RenderingMWs.renderFile
        );
    };

    private addGetImageThumbnail() {
        this.app.get("/api/gallery/:directory/:image/thumbnail",
            AuthenticationMWs.authenticate,
            GalleryMWs.loadThumbnail,
            RenderingMWs.renderFile
        );
    };

    private addSearch() {
        this.app.get("/api/gallery/search",
            AuthenticationMWs.authenticate,
            GalleryMWs.search,
            RenderingMWs.renderResult
        );
    };

    private addAutoComplete() {
        this.app.get("/api/gallery/autocomplete",
            AuthenticationMWs.authenticate,
            GalleryMWs.autocomplete,
            RenderingMWs.renderResult
        );
    };



}