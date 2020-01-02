import {LoginCredential} from '../../../common/entities/LoginCredential';
import {UserEntity} from '../../model/database/sql/enitites/UserEntity';


declare global {
  namespace Express {
    interface Request {

      resultPipe?: any;
      body?: {
        loginCredential?: LoginCredential
      };
      locale?: string;
    }

    interface Response {
      tpl?: any;
    }

    interface Session {
      user?: UserEntity;
      rememberMe?: boolean;
    }
  }
}


