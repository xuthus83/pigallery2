///<reference path="../../browser.d.ts"/>

import {Http, Headers, RequestOptions, Response} from "angular2/http";
import {Message} from "../../../common/entities/Message";
import "rxjs/Rx";

export class NetworkService{

    _baseUrl = "/api";

    constructor(protected _http:Http){
    }

    

    protected postJson(url:string, data:any  = {}){
        let body = JSON.stringify({ data });
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        console.log(this._http.post(this._baseUrl+url, body, options));
        return this._http.post(this._baseUrl+url, body, options)
            .toPromise()
            .then(res => <Message<any>> res.json())
            .catch(NetworkService.handleError);
    }

    private static handleError (error: any) {
        // in a real world app, we may send the error to some remote logging infrastructure
        // instead of just logging it to the console
        console.error(error);
        return Promise.reject(error.message || error.json().error || 'Server error');
    }
}
