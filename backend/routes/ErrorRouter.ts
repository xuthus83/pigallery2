///<reference path="../../typings/index.d.ts"/>

import {RenderingMWs} from "../middlewares/RenderingMWs";
import {Error, ErrorCodes} from "../../common/entities/Error";

export class ErrorRouter {
    constructor(private app) {

        this.addApiErrorHandler();
        this.addGenericHandler();
    }

    private addApiErrorHandler() {
        this.app.use("/api/*",
            RenderingMWs.renderError
        );
    };

    private addGenericHandler() {
        this.app.use((err, req, res, next) => {

                //Flush out the stack to the console
                console.error(err.stack);
                next(new Error(ErrorCodes.SERVER_ERROR, "Unknown server side error"));
            },
            RenderingMWs.renderError
        );
    }

}