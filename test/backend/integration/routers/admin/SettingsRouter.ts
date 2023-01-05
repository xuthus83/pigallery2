import * as path from 'path';
import * as fs from 'fs';
import {Config} from '../../../../../src/common/config/private/Config';
import {SQLConnection} from '../../../../../src/backend/model/database/SQLConnection';
import {Server} from '../../../../../src/backend/server';
import {DatabaseType, ServerConfig} from '../../../../../src/common/config/private/PrivateConfig';
import {ProjectPath} from '../../../../../src/backend/ProjectPath';
import {TAGS} from '../../../../../src/common/config/public/ClientConfig';

process.env.NODE_ENV = 'test';
const chai: any = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);

describe('SettingsRouter', () => {

  const tempDir = path.join(__dirname, '../../tmp');
  beforeEach(async () => {
    await fs.promises.rm(tempDir, {recursive: true, force: true});
    Config.Server.Threading.enabled = false;
    Config.Database.type = DatabaseType.sqlite;
    Config.Database.dbFolder = tempDir;
    ProjectPath.reset();
  });


  afterEach(async () => {
    await SQLConnection.close();
    await fs.promises.rm(tempDir, {recursive: true, force: true});
  });

  describe('/GET settings', () => {
    it('it should GET the settings', async () => {
      Config.Users.authenticationRequired = false;
      const originalSettings = await Config.original();
    //  originalSettings.Server.sessionSecret = null;
     // originalSettings.Users.enforcedUsers = null;
      const srv = new Server();
      await srv.onStarted.wait();
      const result = await chai.request(srv.App)
        .get(Config.Server.apiPath + '/settings');

      result.res.should.have.status(200);
      result.body.should.be.a('object');
      should.equal(result.body.error, null);
      (result.body.result as ServerConfig).Environment.upTime = null;
      originalSettings.Environment.upTime = null;
      result.body.result.should.deep.equal(JSON.parse(JSON.stringify(originalSettings.toJSON({
        attachState: true,
        attachVolatile: true,
        skipTags: {secret: true} as TAGS
      }))));
    });
  });
});
