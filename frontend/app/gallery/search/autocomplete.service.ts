///<reference path="../../../browser.d.ts"/>

import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {NetworkService} from "../../model/network/network.service";
import {AutoCompleteItem} from "../../../../common/entities/AutoCompleteItem";
import {Message} from "../../../../common/entities/Message";

@Injectable()
export class AutoCompleteService extends NetworkService {


    constructor(_http:Http) {
        super(_http);
    }
 
    public autoComplete(text:string): Promise<Message<Array<AutoCompleteItem> >> {
       return  this.getJson("/gallery/autocomplete/"+text);
    }


}
