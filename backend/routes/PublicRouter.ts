///<reference path="../../typings/index.d.ts"/>

import * as _express from "express";
import {NextFunction, Request, Response} from "express";
import * as _path from "path";
import {Utils} from "../../common/Utils";
import {Config} from "../config/Config";

export class PublicRouter {
    constructor(private app) {
        this.app.use((req:Request, res:Response, next:NextFunction) => {
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

        this.app.use(_express.static(_path.resolve(__dirname, './../../frontend')));
        this.app.use('/node_modules', _express.static(_path.resolve(__dirname, './../../node_modules')));

        var renderIndex = (req:Request, res:Response) => {
            res.render(_path.resolve(__dirname, './../../frontend/index.ejs'), res.tpl);
        };

        this.app.get(['/', '/login', "/gallery*", "/admin", "/search*"], renderIndex);


    }

}