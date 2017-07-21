import {Injectable} from "@angular/core";
import {Headers, Http, RequestOptions} from "@angular/http";
import {Message} from "../../../../common/entities/Message";
import {SlimLoadingBarService} from "ng2-slim-loading-bar";
import "rxjs/Rx";
import {ErrorCodes, ErrorDTO} from "../../../../common/entities/Error";

@Injectable()
export class NetworkService {

  _baseUrl = "/api";
  private globalErrorHandlers: Array<(error: ErrorDTO) => boolean> = [];

  constructor(protected _http: Http,
              private slimLoadingBarService: SlimLoadingBarService) {
  }


  private callJson<T>(method: string, url: string, data: any = {}): Promise<T> {
    let body = JSON.stringify(data);
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});

    this.slimLoadingBarService.visible = true;
    this.slimLoadingBarService.start(() => {
      this.slimLoadingBarService.visible = false;
    });

    const process = (data: any): T => {
      this.slimLoadingBarService.complete();
      let res = <Message<any>> data.json();
      if (!!res.error) {
        if (res.error.code) {
          res.error['title'] = ErrorCodes[res.error.code];
        }
        throw res.error;
      }
      return res.result;
    };

    const err = (err) => {
      this.slimLoadingBarService.complete();
      return this.handleError(err);
    };

    if (method == "get" || method == "delete") {
      return <any>this._http[method](this._baseUrl + url, options)
        .toPromise()
        .then(process)
        .catch(err);
    }
    return this._http[method](this._baseUrl + url, body, options)
      .toPromise()
      .then(process)
      .catch(err);
  }

  public postJson<T>(url: string, data: any = {}): Promise<T> {
    return this.callJson("post", url, data);
  }

  public putJson<T>(url: string, data: any = {}): Promise<T> {
    return this.callJson("put", url, data);
  }

  public getJson<T>(url: string, data?: { [key: string]: any }): Promise<T> {
    if (data) {
      const keys = Object.getOwnPropertyNames(data);
      if (keys.length > 0) {
        url += "?";
        for (let i = 0; i < keys.length; i++) {
          url += keys[i] + "=" + data[keys[i]];
          if (i < keys.length - 1) {
            url += "&";
          }
        }
      }
    }
    return this.callJson("get", url);
  }


  public deleteJson<T>(url: string): Promise<T> {
    return this.callJson("delete", url);
  }

  private handleError(error: any) {
    if (typeof error.code !== "undefined") {
      for (let i = 0; i < this.globalErrorHandlers.length; i++) {
        if (this.globalErrorHandlers[i](error) == true) {
          return;
        }
      }
      return Promise.reject(error);
    }
    // instead of just logging it to the console
    console.error(error);
    return Promise.reject(error.message || error || 'Server error');
  }


  addGlobalErrorHandler(fn: (error: ErrorDTO) => boolean) {
    this.globalErrorHandlers.push(fn);
  }
}
