import {Express, NextFunction, Request, Response} from 'express';
import {logFN, Logger} from '../Logger';

declare global {
  namespace Express {
    interface Request {
      _startTime?: number;
      logged?: boolean;
    }
  }
}

/**
 * Adds logging to express
 */
export class LoggerRouter {
  public static log(loggerFn: logFN, req: Request, res: Response) {
    if (req.logged === true) {
      return;
    }
    req.logged = true;
    req._startTime = Date.now();
    const end = res.end;
    res.end = (a?: any, b?: any, c?: any) => {
      res.end = end;
      res.end(a, b, c);
      loggerFn(req.method, req.url, res.statusCode, (Date.now() - req._startTime) + 'ms');
    };
  }

  public static route(app: Express) {

    app.get('/api*', (req: Request, res: Response, next: NextFunction) => {
      LoggerRouter.log(Logger.verbose, req, res);
      return next();
    });

    app.get('/node_modules*', (req: Request, res: Response, next: NextFunction) => {
      LoggerRouter.log(Logger.silly, req, res);
      return next();
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
      LoggerRouter.log(Logger.debug, req, res);
      return next();
    });

  }
}
