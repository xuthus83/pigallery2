///<reference path="../../typings/main.d.ts"/>

import {RenderingMWs} from "../middlewares/RenderingMWs";

export class ErrorRouter{
    constructor(private app) {

        this.addApiErrorHandler();
    }

    private addApiErrorHandler() {
        this.app.use("/api/*",
            RenderingMWs.renderError
        );
    };

    private addGenericHandler() {
        this.app.use((err, req, res, next) =>   {
            res.status(500).send('Houston, we have a problem!');

            //Flush out the stack to the console
            console.error(err.stack);
        });
        
    }




}