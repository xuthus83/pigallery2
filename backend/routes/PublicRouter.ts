///<reference path="../../typings/main.d.ts"/>


import * as _express from 'express';
import * as path from 'path';

export class PublicRouter{
    constructor(private app){
        this.app.use(_express.static(path.resolve(__dirname, './../../frontend')));
        this.app.use('/node_modules',_express.static(path.resolve(__dirname, './../../node_modules')));

    }
    
}