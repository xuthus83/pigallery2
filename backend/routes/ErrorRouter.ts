import {RenderingMWs} from "../middlewares/RenderingMWs";
import {Error, ErrorCodes} from "../../common/entities/Error";
import Request = Express.Request;
import Response = Express.Response;

export class ErrorRouter {
    constructor(private app: any) {

        this.addApiErrorHandler();
        this.addGenericHandler();
    }

    private addApiErrorHandler() {
        this.app.use("/api/*",
            RenderingMWs.renderError
        );
    };

    private addGenericHandler() {
        this.app.use((err: any, req: Request, res: Response, next: Function) => {

                //Flush out the stack to the console
                console.error(err.stack);
                next(new Error(ErrorCodes.SERVER_ERROR, "Unknown server side error"));
            },
            RenderingMWs.renderError
        );
    }

}