import {AuthenticationMWs} from '../../middlewares/user/AuthenticationMWs';
import {UserRoles} from '../../../common/entities/UserDTO';
import {RenderingMWs} from '../../middlewares/RenderingMWs';
import {AdminMWs} from '../../middlewares/admin/AdminMWs';
import {Express} from 'express';

export class AdminRouter {
  public static route(app: Express) {

    this.addGetStatistic(app);
    this.addGetDuplicates(app);
    this.addTasks(app);
  }

  private static addGetStatistic(app: Express) {
    app.get('/api/admin/statistic',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      AdminMWs.loadStatistic,
      RenderingMWs.renderResult
    );
  }

  private static addGetDuplicates(app: Express) {
    app.get('/api/admin/duplicates',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      AdminMWs.getDuplicates,
      RenderingMWs.renderResult
    );
  }

  private static addTasks(app: Express) {
    app.get('/api/admin/tasks/available',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      AdminMWs.getAvailableTasks,
      RenderingMWs.renderResult
    );
    app.get('/api/admin/tasks/scheduled/progress',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      AdminMWs.getTaskProgresses,
      RenderingMWs.renderResult
    );
    app.post('/api/admin/tasks/scheduled/:id/start',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      AdminMWs.startTask,
      RenderingMWs.renderResult
    );
    app.post('/api/admin/tasks/scheduled/:id/stop',
      AuthenticationMWs.authenticate,
      AuthenticationMWs.authorise(UserRoles.Admin),
      AdminMWs.stopTask,
      RenderingMWs.renderResult
    );
  }


}
