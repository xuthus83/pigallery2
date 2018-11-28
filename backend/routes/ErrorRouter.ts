import {RenderingMWs} from '../middlewares/RenderingMWs';
import {ErrorCodes, ErrorDTO} from '../../common/entities/Error';
import {Logger} from '../Logger';
import Request = Express.Request;
import Response = Express.Response;
import {Express} from 'express';

export class ErrorRouter {
  public static route(app: Express) {

    this.addApiErrorHandler(app);
    this.addGenericHandler(app);
  }

  private static addApiErrorHandler(app: Express) {
    app.use('/api/*',
      RenderingMWs.renderError
    );
  }

  private static addGenericHandler(app: Express) {
    app.use((err: any, req: Request, res: Response, next: Function) => {
        // Flush out the stack to the console
        Logger.error('Unexpected error:');
        console.error(err);
        next(new ErrorDTO(ErrorCodes.SERVER_ERROR, 'Unknown server side error', err));
      },
      RenderingMWs.renderError
    );
  }

}
