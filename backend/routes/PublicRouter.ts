///<reference path="../../typings/main.d.ts"/>


import * as _express from 'express';
import * as _path from 'path';

export class PublicRouter{
    constructor(private app){
        this.app.use(_express.static(_path.resolve(__dirname, './../../frontend')));
        this.app.use('/node_modules',_express.static(_path.resolve(__dirname, './../../node_modules')));

        var renderIndex = (req: _express.Request, res: _express.Response) => {
            res.sendFile(_path.resolve(__dirname, './../../frontend/index.html'));
        };
        this.app.get(['/login',"/gallery*"], renderIndex);


    }
    
}