///<reference path="../../typings/main.d.ts"/>

import {RenderingMWs} from "../middlewares/RenderingMWs";

export class ErrorRouter{
    constructor(private app) {

        this.addError(); 
    }

    private addError() {
        this.app.use("/api/*",
            RenderingMWs.renderError
        );
    };





}