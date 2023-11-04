import * as express from 'express';
import {NextFunction, Request, Response} from 'express';
import {UserDTO, UserRoles} from '../../../common/entities/UserDTO';
import {AuthenticationMWs} from '../../middlewares/user/AuthenticationMWs';
import {RenderingMWs} from '../../middlewares/RenderingMWs';
import {ParamsDictionary} from 'express-serve-static-core';
import {IExtensionRESTApi, IExtensionRESTRoute} from './IExtension';
import {Logger} from '../../Logger';
import {ExtensionManager} from './ExtensionManager';
import {Utils} from '../../../common/Utils';


export class ExpressRouterWrapper implements IExtensionRESTApi {

  constructor(private readonly router: express.Router, private readonly name: string) {
  }

  get use() {
    return new ExpressRouteWrapper(this.router, this.name, 'use');
  }

  get get() {
    return new ExpressRouteWrapper(this.router, this.name, 'get');
  }

  get put() {
    return new ExpressRouteWrapper(this.router, this.name, 'put');
  }

  get post() {
    return new ExpressRouteWrapper(this.router, this.name, 'post');
  }

  get delete() {
    return new ExpressRouteWrapper(this.router, this.name, 'delete');
  }

}

export class ExpressRouteWrapper implements IExtensionRESTRoute {

  constructor(private readonly router: express.Router,
              private readonly name: string,
              private readonly func: 'get' | 'use' | 'put' | 'post' | 'delete') {
  }

  private getAuthMWs(minRole: UserRoles) {
    return minRole ? [AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(minRole)] : [];
  }

  public jsonResponse(paths: string[], minRole: UserRoles, cb: (params?: ParamsDictionary, body?: any, user?: UserDTO) => Promise<unknown> | unknown) {
    const fullPaths = paths.map(p => (Utils.concatUrls('/' + this.name + '/' + p)));
    this.router[this.func](fullPaths,
      ...(this.getAuthMWs(minRole).concat([
        async (req: Request, res: Response, next: NextFunction) => {
          req.resultPipe = await cb(req.params, req.body, req.session['user']);
          next();
        },
        RenderingMWs.renderResult
      ])));
    Logger.silly(`[ExtensionRest:${this.name}]`, `Listening on ${this.func} ${ExtensionManager.EXTENSION_API_PATH}${fullPaths}`);
  }

  public rawMiddleware(paths: string[], minRole: UserRoles, mw: (req: Request, res: Response, next: NextFunction) => void | Promise<void>) {
    const fullPaths = paths.map(p =>  (Utils.concatUrls('/' + this.name + '/' + p)));
    this.router[this.func](fullPaths,
      ...this.getAuthMWs(minRole),
      mw);
    Logger.silly(`[ExtensionRest:${this.name}]`, `Listening on ${this.func} ${ExtensionManager.EXTENSION_API_PATH}${fullPaths}`);
  }
}
