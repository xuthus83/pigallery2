import {Injectable} from "@angular/core";
import {Http, Headers, RequestOptions} from "@angular/http";
import {Message} from "../../../../common/entities/Message";
import "rxjs/Rx";

@Injectable()
export class NetworkService {

    _baseUrl = "/api";

    constructor(protected _http:Http) {
    }

    private callJson<T>(method:string, url:string, data:any = {}):Promise<T> {
        let body = JSON.stringify(data);
        let headers = new Headers({'Content-Type': 'application/json'});
        let options = new RequestOptions({headers: headers});

        if (method == "get" || method == "delete") {
            return <any>this._http[method](this._baseUrl + url, options)
                .toPromise()
                .then(res => <Message<any>> res.json())
                .catch(NetworkService.handleError);
        } 

        return this._http[method](this._baseUrl + url, body, options)
            .toPromise()
            .then((res: any) => <Message<any>> res.json())
            .catch(NetworkService.handleError);
    }

    public postJson<T>(url:string, data:any = {}):Promise<T> {
        return this.callJson("post", url, data);
    }

    public putJson<T>(url:string, data:any = {}):Promise<T> {
        return this.callJson("put", url, data);
    }

    public getJson<T>(url:string):Promise<T> {
        return this.callJson("get", url);
    }


    public deleteJson<T>(url:string):Promise<T> {
        return this.callJson("delete", url);
    }

    private static handleError(error:any) {
        // TODO: in a real world app do smthing better
        // instead of just logging it to the console
        console.error(error);
        return Promise.reject(error.message || error.json().error || 'Server error');
    }
}
