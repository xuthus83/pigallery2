import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Message} from '../../../../common/entities/Message';
import {SlimLoadingBarService} from 'ng2-slim-loading-bar';
import 'rxjs/Rx';
import {ErrorCodes, ErrorDTO} from '../../../../common/entities/Error';
import {Config} from '../../../../common/config/public/Config';
import {Utils} from '../../../../common/Utils';

@Injectable()
export class NetworkService {

  _apiBaseUrl = Utils.concatUrls(Config.Client.urlBase, '/api');
  private globalErrorHandlers: Array<(error: ErrorDTO) => boolean> = [];

  constructor(private _http: HttpClient,
              private slimLoadingBarService: SlimLoadingBarService) {
  }

  public postJson<T>(url: string, data: any = {}): Promise<T> {
    return this.callJson('post', url, data);
  }

  public putJson<T>(url: string, data: any = {}): Promise<T> {
    return this.callJson('put', url, data);
  }

  public getJson<T>(url: string, data?: { [key: string]: any }): Promise<T> {
    if (data) {
      const keys = Object.getOwnPropertyNames(data);
      if (keys.length > 0) {
        url += '?';
        for (let i = 0; i < keys.length; i++) {
          url += keys[i] + '=' + data[keys[i]];
          if (i < keys.length - 1) {
            url += '&';
          }
        }
      }
    }
    return this.callJson('get', url);
  }

  public deleteJson<T>(url: string): Promise<T> {
    return this.callJson('delete', url);
  }

  private callJson<T>(method: 'get' | 'post' | 'delete' | 'put', url: string, data: any = {}): Promise<T> {
    const body = data;

    this.slimLoadingBarService.visible = true;
    this.slimLoadingBarService.start(() => {
      this.slimLoadingBarService.visible = false;
    });

    const process = (res: Message<T>): T => {
      this.slimLoadingBarService.complete();
      if (!!res.error) {
        if (res.error.code) {
          res.error['title'] = ErrorCodes[res.error.code];
        }
        throw res.error;
      }
      return res.result;
    };

    const err = (error) => {
      this.slimLoadingBarService.complete();
      return this.handleError(error);
    };

    switch (method) {
      case 'get':
        return this._http.get<Message<T>>(this._apiBaseUrl + url)
          .toPromise()
          .then(process)
          .catch(err);
      case 'delete':
        return this._http.delete<Message<T>>(this._apiBaseUrl + url)
          .toPromise()
          .then(process)
          .catch(err);
      case 'post':
        return this._http.post<Message<T>>(this._apiBaseUrl + url, body)
          .toPromise()
          .then(process)
          .catch(err);
      case 'put':
        return this._http.put<Message<T>>(this._apiBaseUrl + url, body)
          .toPromise()
          .then(process)
          .catch(err);
      default:
        throw new Error('Unknown method');
    }

  }

  private handleError(error: any) {
    if (typeof error.code !== 'undefined') {
      for (let i = 0; i < this.globalErrorHandlers.length; i++) {
        if (this.globalErrorHandlers[i](error) === true) {
          return;
        }
      }
      return Promise.reject(error);
    }
    // instead of just logging it to the console
    console.error('error:', error);
    return Promise.reject(error.message || error || 'Server error');
  }


  addGlobalErrorHandler(fn: (error: ErrorDTO) => boolean) {
    this.globalErrorHandlers.push(fn);
  }
}
