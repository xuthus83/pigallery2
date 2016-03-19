///<reference path="../../typings/main.d.ts"/>

import {AuthenticationMWs} from "../middlewares/AuthenticationMWs";

export class GalleryRouter{
    constructor(private app){

        this.addDirectoryList();
        this.addGetImageThumbnail();
        this.addGetImage();

        this.addSearch();
        this.addAutoComplete();
    }

    private addDirectoryList() {
        this.app.get("/api/gallery/:directory",
            AuthenticationMWs.authenticate
            //TODO: implement
        );
    };


    private addGetImage() {
        this.app.get("/api/gallery/:directory/:image",
            AuthenticationMWs.authenticate
            //TODO: implement
        );
    };

    private addGetImageThumbnail() {
        this.app.get("/api/gallery/:directory/:image/thumbnail",
            AuthenticationMWs.authenticate
            //TODO: implement
        );
    };

    private addSearch() {
        this.app.get("/api/gallery/search",
            AuthenticationMWs.authenticate
            //TODO: implement
        );
    };

    private addAutoComplete() {
        this.app.get("/api/gallery/autocomplete",
            AuthenticationMWs.authenticate
            //TODO: implement
        );
    };



}