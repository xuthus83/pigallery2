import {Server} from '../../../../src/backend/server';
import {Config} from '../../../../src/common/config/private/Config';
import {LoginCredential} from '../../../../src/common/entities/LoginCredential';
import {UserDTO, UserRoles} from '../../../../src/common/entities/UserDTO';
import * as path from 'path';
import * as util from 'util';
import * as rimraf from 'rimraf';
import {ServerConfig} from '../../../../src/common/config/private/IPrivateConfig';
import {SQLConnection} from '../../../../src/backend/model/database/sql/SQLConnection';

process.env.NODE_ENV = 'test';
const chai: any = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);

const rimrafPR = util.promisify(rimraf);
describe('UserRouter', () => {

  const tempDir = path.join(__dirname, '../../tmp');
  beforeEach(async () => {
    await rimrafPR(tempDir);
    Config.Server.Threading.enabled = false;
    Config.Server.Database.type = ServerConfig.DatabaseType.sqlite;
    Config.Server.Database.dbFolder = tempDir;
  });


  afterEach(async () => {
    await SQLConnection.close();
    await rimrafPR(tempDir);
  });

  describe('/GET login', () => {
    it('it should GET all the books', async () => {
      const srv = new Server();
      await srv.onStarted.wait();
      const result = await chai.request(srv.App)
        .post('/api/user/login')
        .send({loginCredential: <LoginCredential>{password: 'admin', username: 'admin', rememberMe: false}});

      result.res.should.have.status(200);
      result.body.should.be.a('object');
      should.equal(result.body.error, null);
      result.body.result.should.deep.equal(<UserDTO>{id: 1, name: 'admin', role: UserRoles.Admin, permissions: null});

    });
  });
});
