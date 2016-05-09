///<reference path="../../browser.d.ts"/>

import {Injectable} from "@angular/core";
import {NetworkService} from "../model/network/network.service.ts";
import {Message} from "../../../common/entities/Message";
import {ContentWrapper} from "../../../common/entities/ConentWrapper";

@Injectable()
export class GalleryService {

    public content:ContentWrapper;
    
    constructor(private _networkService:NetworkService) {
        this.content = new ContentWrapper();
    }

    public getDirectory(directoryName:string):Promise<Message<ContentWrapper>> {
        return this._networkService.getJson("/gallery/content/" + directoryName).then(
            (message:Message<ContentWrapper>) => {
                if (!message.error && message.result) {
                    this.content = message.result;
                }
                return message;
            });
    }

    public search(text:string):Promise<Message<ContentWrapper>> {
        return this._networkService.getJson("/gallery/search/" + text).then(
            (message:Message<ContentWrapper>) => {
                if (!message.error && message.result) {
                    this.content = message.result;
                }
                return message;
            });
    }

    public instantSearch(text:string):Promise<Message<ContentWrapper>> {
        return this._networkService.getJson("/gallery/instant-search/" + text).then(
            (message:Message<ContentWrapper>) => {
                if (!message.error && message.result) {
                    this.content = message.result;
                }
                return message;
            });
    }

}
