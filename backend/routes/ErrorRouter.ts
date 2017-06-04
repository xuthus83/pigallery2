import {RenderingMWs} from "../middlewares/RenderingMWs";
import {Error, ErrorCodes} from "../../common/entities/Error";
import {Logger} from "../Logger";
import Request = Express.Request;
import Response = Express.Response;

export class ErrorRouter {
    public static route(app: any) {

        this.addApiErrorHandler(app);
        this.addGenericHandler(app);
    }

    private static addApiErrorHandler(app) {
        app.use("/api/*",
            RenderingMWs.renderError
        );
    };

    private static addGenericHandler(app) {
        app.use((err: any, req: Request, res: Response, next: Function) => {

                //Flush out the stack to the console
                Logger.error(err);
                next(new Error(ErrorCodes.SERVER_ERROR, "Unknown server side error"));
            },
            RenderingMWs.renderError
        );
    }

}