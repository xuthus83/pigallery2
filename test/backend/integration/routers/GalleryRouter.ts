import {Config} from '../../../../src/common/config/private/Config';
import {Server} from '../../../../src/backend/server';
import * as path from 'path';
import * as util from 'util';
import {expect} from 'chai';
import * as rimraf from 'rimraf';
import {SQLConnection} from '../../../../src/backend/model/database/sql/SQLConnection';
import {SuperAgentStatic} from 'superagent';
import {ProjectPath} from '../../../../src/backend/ProjectPath';
import {ServerConfig} from '../../../../src/common/config/private/PrivateConfig';


process.env.NODE_ENV = 'test';
const chai: any = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
chai.use(chaiHttp);

const rimrafPR = util.promisify(rimraf);
describe('GalleryRouter', () => {

  const tempDir = path.join(__dirname, '../../tmp');
  let server: Server;
  const setUp = async () => {
    await rimrafPR(tempDir);
    Config.Client.authenticationRequired = false;
    Config.Server.Threading.enabled = false;
    Config.Client.Media.Video.enabled = true;
    Config.Server.Database.type = ServerConfig.DatabaseType.sqlite;
    Config.Server.Database.dbFolder = tempDir;
    ProjectPath.ImageFolder = path.join(__dirname, '../../assets');
    ProjectPath.TempFolder = tempDir;

    server = new Server();
    await server.onStarted.wait();

  };
  const tearDown = async () => {
    await SQLConnection.close();
    await rimrafPR(tempDir);
  };


  describe('/GET /api/gallery/content/video.mp4/bestFit', () => {

    beforeEach(setUp);
    afterEach(tearDown);

    it('should get video without transcoding', async () => {
      const result = await (chai.request(server.App) as SuperAgentStatic)
        .get('/api/gallery/content/video.mp4/bestFit');

      (result.should as any).have.status(200);
      expect(result.body).to.be.instanceof(Buffer);
    });


  });


});
