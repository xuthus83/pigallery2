import {Express, NextFunction, Request, Response} from 'express';
import {Logger} from '../Logger';

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
  public static route(app: Express) {

    app.get('/api*', (req: Request, res: Response, next: NextFunction) => {
      req._startTime = Date.now();
      req.logged = true;
      const end = res.end;
      res.end = (a?: any, b?: any, c?: any) => {
        res.end = end;
        res.end(a, b, c);
        Logger.verbose(req.method, req.url, res.statusCode, (Date.now() - req._startTime) + 'ms');
      };
      return next();
    });

    app.get('/node_modules*', (req: Request, res: Response, next: NextFunction) => {
      req._startTime = Date.now();
      req.logged = true;
      const end = res.end;
      res.end = (a?: any, b?: any, c?: any) => {
        res.end = end;
        res.end(a, b, c);
        Logger.silly(req.method, req.url, res.statusCode, (Date.now() - req._startTime) + 'ms');
      };
      return next();
    });

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.logged === true) {
        return next();
      }
      req._startTime = Date.now();
      const end = res.end;
      res.end = (a?: any, b?: any, c?: any) => {
        res.end = end;
        res.end(a, b, c);
        Logger.debug(req.method, req.url, res.statusCode, (Date.now() - req._startTime) + 'ms');
      };
      return next();
    });

  }
}
