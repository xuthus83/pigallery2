import {NextFunction, Request, Response} from "express";
import * as path from "path";
import * as fs from "fs";
import {Utils} from "../../common/Utils";
import {Config} from "../../common/config/private/Config";
import {ProjectPath} from "../ProjectPath";
import {AuthenticationMWs} from "../middlewares/user/AuthenticationMWs";
import {CookieNames} from "../../common/CookieNames";


export class PublicRouter {

  public static route(app) {
    const setLocale = (req: Request, res: Response, next: Function) => {
      let localePath = "";
      let selectedLocale = req['locale'];
      if (req.cookies && req.cookies[CookieNames.lang]) {
        if (Config.Client.languages.indexOf(req.cookies[CookieNames.lang]) !== -1) {
          selectedLocale = req.cookies[CookieNames.lang];
        }
      }
      if (selectedLocale !== 'en') {
        localePath = req['locale'];
      }
      res.cookie(CookieNames.lang, selectedLocale);
      req['localePath'] = localePath;
      next();
    };

    const renderIndex = (req: Request, res: Response) => {
      res.sendFile(path.resolve(ProjectPath.FrontendFolder, req['localePath'], 'index.html'), {maxAge: 31536000});
    };


    const redirectToBase = (locale: string) => {
      return (req: Request, res: Response) => {
        console.log(locale);
        if (Config.Client.languages.indexOf(locale) !== -1) {
          res.cookie(CookieNames.lang, locale);
        }
        res.redirect("/");
      };
    };

    app.use(
      (req: Request, res: Response, next: NextFunction) => {
        res.tpl = {};

        res.tpl.user = null;
        if (req.session.user) {
          let user = Utils.clone(req.session.user);
          delete user.password;
          res.tpl.user = user;
        }
        res.tpl.clientConfig = Config.Client;

        return next();
      });

    app.get('/config_inject.js', (req: Request, res: Response) => {
      res.render(path.resolve(ProjectPath.FrontendFolder, 'config_inject.ejs'), res.tpl);
    });

    app.get(['/', '/login', "/gallery*", "/share*", "/admin", "/search*"],
      AuthenticationMWs.tryAuthenticate,
      setLocale,
      renderIndex
    );
    Config.Client.languages.forEach(l => {
      app.get(['/' + l + '/', '/' + l + '/login', '/' + l + "/gallery*", '/' + l + "/share*", '/' + l + "/admin", '/' + l + "/search*"],
        redirectToBase(l)
      );
    });

    app.get('/assets/:file',
      setLocale,
      (req: Request, res: Response) => {
        const file = path.resolve(ProjectPath.FrontendFolder, req['localePath'], 'assets', req.params.file);
        fs.exists(file, (exists: boolean) => {
          if (!exists) {
            return res.sendStatus(404);
          }
          res.sendFile(file);
        });
      });
    app.get('/:file',
      setLocale,
      (req: Request, res: Response) => {
        const file = path.resolve(ProjectPath.FrontendFolder, req['localePath'], req.params.file);
        fs.exists(file, (exists: boolean) => {
          if (!exists) {
            return res.sendStatus(404);
          }
          res.sendFile(file);
        });
      });
  }

}
