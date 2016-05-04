///<reference path="../../browser.d.ts"/>

import {Injectable} from '@angular/core';
import {NetworkService} from "../model/network/network.service.ts";
import {Http} from "@angular/http";
import {Message} from "../../../common/entities/Message";
import {Directory} from "../../../common/entities/Directory"; 

@Injectable()
export class GalleryService  extends NetworkService{
 

    constructor(_http:Http){
        super(_http);
    }

    public getDirectory(directoryName:string): Promise<Message<Directory>>{
        return this.getJson("/gallery/content/"+directoryName);
    }


 


}
