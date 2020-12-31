import {Config} from '../src/common/config/private/Config';
import {ObjectManagers} from '../src/backend/model/ObjectManagers';
import {DiskMangerWorker} from '../src/backend/model/threading/DiskMangerWorker';
import {IndexingManager} from '../src/backend/model/database/sql/IndexingManager';
import * as util from 'util';
import * as path from 'path';
import * as rimraf from 'rimraf';
import {SearchTypes} from '../src/common/entities/AutoCompleteItem';
import {Utils} from '../src/common/Utils';
import {DirectoryDTO} from '../src/common/entities/DirectoryDTO';
import {ServerConfig} from '../src/common/config/private/PrivateConfig';
import {ProjectPath} from '../src/backend/ProjectPath';
import {Benchmark} from './Benchmark';
import {IndexingJob} from '../src/backend/model/jobs/jobs/IndexingJob';
import {IJob} from '../src/backend/model/jobs/jobs/IJob';
import {JobProgressStates} from '../src/common/entities/job/JobProgressDTO';
import {JobProgress} from '../src/backend/model/jobs/jobs/JobProgress';
import {ContentWrapper} from '../src/common/entities/ConentWrapper';
import {GalleryManager} from '../src/backend/model/database/sql/GalleryManager';
import {PersonManager} from '../src/backend/model/database/sql/PersonManager';
import {GalleryRouter} from '../src/backend/routes/GalleryRouter';
import {Express} from 'express';
import {PersonRouter} from '../src/backend/routes/PersonRouter';
import {QueryParams} from '../src/common/QueryParams';

const rimrafPR = util.promisify(rimraf);

export interface BenchmarkResult {
  name: string;
  duration: number;
  contentWrapper?: ContentWrapper;
  items?: number;
  subBenchmarks?: BenchmarkResult[];
}

export class BMIndexingManager extends IndexingManager {

  public async saveToDB(scannedDirectory: DirectoryDTO): Promise<void> {
    return super.saveToDB(scannedDirectory);
  }
}


class BMGalleryRouter extends GalleryRouter {
  public static addDirectoryList(app: Express) {
    GalleryRouter.addDirectoryList(app);
  }

  public static addSearch(app: Express) {
    GalleryRouter.addSearch(app);
  }

  public static addInstantSearch(app: Express) {
    GalleryRouter.addInstantSearch(app);
  }

  public static addAutoComplete(app: Express) {
    GalleryRouter.addAutoComplete(app);
  }
}

class BMPersonRouter extends PersonRouter {
  public static addGetPersons(app: Express) {
    PersonRouter.addGetPersons(app);
  }
}

export class BenchmarkRunner {
  inited = false;
  private biggestDirPath: string = null;
  private readonly requestTemplate: any = {
    requestPipe: null,
    params: {},
    query: {},
    session: {}
  };

  constructor(public RUNS: number) {
    Config.Client.authenticationRequired = false;
  }

  async bmSaveDirectory(): Promise<BenchmarkResult> {
    await this.init();
    await this.resetDB();
    const dir = await DiskMangerWorker.scanDirectory(this.biggestDirPath);
    const bm = new Benchmark('Saving directory to DB', null, () => this.resetDB());
    bm.addAStep({
      name: 'Saving directory to DB',
      fn: () => {
        const im = new BMIndexingManager();
        return im.saveToDB(dir);
      }
    });
    return await bm.run(this.RUNS);
  }

  async bmScanDirectory(): Promise<BenchmarkResult> {
    await this.init();
    const bm = new Benchmark('Scanning directory');
    bm.addAStep({
      name: 'Scanning directory',
      fn: async () => new ContentWrapper(await DiskMangerWorker.scanDirectory(this.biggestDirPath))
    });
    return await bm.run(this.RUNS);
  }

  async bmListDirectory(): Promise<BenchmarkResult> {
    await this.init();
    await this.setupDB();
    Config.Server.Indexing.reIndexingSensitivity = ServerConfig.ReIndexingSensitivity.low;
    const req = Utils.clone(this.requestTemplate);
    req.params.directory = this.biggestDirPath;
    const bm = new Benchmark('List directory', req,
      async () => {
        await ObjectManagers.reset();
        await ObjectManagers.InitSQLManagers();
      });
    BMGalleryRouter.addDirectoryList(bm.BmExpressApp);
    return await bm.run(this.RUNS);
  }

  async bmListPersons(): Promise<BenchmarkResult> {
    await this.setupDB();
    Config.Server.Indexing.reIndexingSensitivity = ServerConfig.ReIndexingSensitivity.low;
    const bm = new Benchmark('Listing Faces', Utils.clone(this.requestTemplate), async () => {
      await ObjectManagers.reset();
      await ObjectManagers.InitSQLManagers();
    });
    BMPersonRouter.addGetPersons(bm.BmExpressApp);
    return await bm.run(this.RUNS);
  }

  async bmAllSearch(text: string): Promise<{ result: BenchmarkResult, searchType: SearchTypes }[]> {
    await this.setupDB();
    const types = Utils.enumToArray(SearchTypes).map(a => a.key).concat([null]);
    const results: { result: BenchmarkResult, searchType: SearchTypes }[] = [];

    for (let i = 0; i < types.length; i++) {
      const req = Utils.clone(this.requestTemplate);
      req.params.text = text;
      req.query[QueryParams.gallery.search.type] = types[i];
      const bm = new Benchmark('Searching for `' + text + '` as `' + (types[i] ? SearchTypes[types[i]] : 'any') + '`', req);
      BMGalleryRouter.addSearch(bm.BmExpressApp);

      results.push({result: await bm.run(this.RUNS), searchType: types[i]});
    }
    return results;
  }

  async bmInstantSearch(text: string): Promise<BenchmarkResult> {
    await this.setupDB();
    const req = Utils.clone(this.requestTemplate);
    req.params.text = text;
    const bm = new Benchmark('Instant search for `' + text + '`', req);
    BMGalleryRouter.addInstantSearch(bm.BmExpressApp);
    return await bm.run(this.RUNS);
  }

  async bmAutocomplete(text: string): Promise<BenchmarkResult> {
    await this.setupDB();
    const req = Utils.clone(this.requestTemplate);
    req.params.text = text;
    const bm = new Benchmark('Auto complete for `' + text + '`', req);
    BMGalleryRouter.addAutoComplete(bm.BmExpressApp);
    return await bm.run(this.RUNS);
  }

  async getStatistic() {
    await this.setupDB();
    const gm = new GalleryManager();
    const pm = new PersonManager();


    return 'directories: ' + await gm.countDirectories() +
      ', photos: ' + await gm.countPhotos() +
      ', videos: ' + await gm.countVideos() +
      ', diskUsage : ' + Utils.renderDataSize(await gm.countMediaSize()) +
      ', persons : ' + await pm.countFaces() +
      ', unique persons (faces): ' + (await pm.getAll()).length;

  }

  private async init() {
    if (this.inited === false) {
      await this.setupDB();

      const gm = new GalleryManager();
      let biggest = 0;
      let biggestPath = '/';
      const queue = ['/'];
      while (queue.length > 0) {
        const dirPath = queue.shift();
        const dir = await gm.listDirectory(dirPath);
        dir.directories.forEach(d => queue.push(path.join(d.path + d.name)));
        if (biggest < dir.media.length) {
          biggestPath = path.join(dir.path + dir.name);
          biggest = dir.media.length;
        }
      }
      this.biggestDirPath = biggestPath;
      console.log('updating path of biggest dir to: ' + this.biggestDirPath);
      this.inited = true;
    }
    return this.biggestDirPath;

  }


  private resetDB = async () => {
    Config.Server.Threading.enabled = false;
    await ObjectManagers.reset();
    await rimrafPR(ProjectPath.DBFolder);
    Config.Server.Database.type = ServerConfig.DatabaseType.sqlite;
    Config.Server.Jobs.scheduled = [];
    await ObjectManagers.InitSQLManagers();
  };

  private setupDB(): Promise<void> {
    Config.Server.Threading.enabled = false;
    return new Promise<void>(async (resolve, reject) => {
      try {
        await this.resetDB();
        const indexingJob = new IndexingJob();

        indexingJob.JobListener = {
          onJobFinished: (job: IJob<any>, state: JobProgressStates, soloRun: boolean) => {
            resolve();
          },

          onProgressUpdate: (progress: JobProgress) => {
          }
        };
        indexingJob.start().catch(console.error);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }
}
