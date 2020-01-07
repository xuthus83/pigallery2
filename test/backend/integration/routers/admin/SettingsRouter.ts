import * as path from 'path';
import * as util from 'util';
import * as rimraf from 'rimraf';
import {Config} from '../../../../../src/common/config/private/Config';
import {ServerConfig} from '../../../../../src/common/config/private/IPrivateConfig';
import {SQLConnection} from '../../../../../src/backend/model/database/sql/SQLConnection';
import {Server} from '../../../../../src/backend/server';

process.env.NODE_ENV = 'test';
const chai: any = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);

const rimrafPR = util.promisify(rimraf);
describe('SettingsRouter', () => {

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

  describe('/GET settings', () => {
    it('it should GET all the books', async () => {
      Config.Client.authenticationRequired = false;
      const originalSettings = Config.original();
      originalSettings.Server.sessionSecret = null;
      const srv = new Server();
      await srv.onStarted.wait();
      const result = await chai.request(srv.App)
        .get('/api/settings');

      result.res.should.have.status(200);
      result.body.should.be.a('object');
      should.equal(result.body.error, null);
      result.body.result.should.deep.equal(originalSettings);

    });
  });
});
