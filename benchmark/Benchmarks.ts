import {SQLConnection} from '../src/backend/model/database/sql/SQLConnection';
import {Config} from '../src/common/config/private/Config';
import {ObjectManagers} from '../src/backend/model/ObjectManagers';
import {DiskMangerWorker} from '../src/backend/model/threading/DiskMangerWorker';
import {IndexingManager} from '../src/backend/model/database/sql/IndexingManager';
import {SearchManager} from '../src/backend/model/database/sql/SearchManager';
import * as util from 'util';
import * as rimraf from 'rimraf';
import {SearchTypes} from '../src/common/entities/AutoCompleteItem';
import {Utils} from '../src/common/Utils';
import {GalleryManager} from '../src/backend/model/database/sql/GalleryManager';
import {DirectoryDTO} from '../src/common/entities/DirectoryDTO';
import {ServerConfig} from '../src/common/config/private/IPrivateConfig';

const rimrafPR = util.promisify(rimraf);

export interface BenchmarkResult {
  duration: number;
  directories?: number;
  media?: number;
  items?: number;
}

export class BMIndexingManager extends IndexingManager {

  public async saveToDB(scannedDirectory: DirectoryDTO): Promise<void> {
    return super.saveToDB(scannedDirectory);
  }
}

export class Benchmarks {

  constructor(public RUNS: number, public dbFolder: string) {

  }

  async bmSaveDirectory(): Promise<BenchmarkResult> {
    await this.resetDB();
    const dir = await DiskMangerWorker.scanDirectory('./');
    const im = new BMIndexingManager();
    return await this.benchmark(() => im.saveToDB(dir), () => this.resetDB());
  }

  async bmScanDirectory(): Promise<BenchmarkResult> {
    return await this.benchmark(() => DiskMangerWorker.scanDirectory('./'));
  }

  async bmListDirectory(): Promise<BenchmarkResult> {
    const gm = new GalleryManager();
    await this.setupDB();
    Config.Server.Indexing.reIndexingSensitivity = ServerConfig.ReIndexingSensitivity.low;
    return await this.benchmark(() => gm.listDirectory('./'));
  }

  async bmAllSearch(text: string): Promise<{ result: BenchmarkResult, searchType: SearchTypes }[]> {
    await this.setupDB();
    const types = Utils.enumToArray(SearchTypes).map(a => a.key).concat([null]);
    const results: { result: BenchmarkResult, searchType: SearchTypes }[] = [];
    const sm = new SearchManager();
    for (let i = 0; i < types.length; i++) {
      results.push({result: await this.benchmark(() => sm.search(text, types[i])), searchType: types[i]});
    }
    return results;
  }

  async bmInstantSearch(text: string): Promise<BenchmarkResult> {
    await this.setupDB();
    const sm = new SearchManager();
    return await this.benchmark(() => sm.instantSearch(text));
  }

  async bmAutocomplete(text: string): Promise<BenchmarkResult> {
    await this.setupDB();
    const sm = new SearchManager();
    return await this.benchmark(() => sm.autocomplete(text));
  }


  private async benchmark(fn: () => Promise<{ media: any[], directories: any[] } | any[] | void>,
                          beforeEach: () => Promise<any> = null,
                          afterEach: () => Promise<any> = null) {
    const scanned = await fn();
    const start = process.hrtime();
    let skip = 0;
    for (let i = 0; i < this.RUNS; i++) {
      if (beforeEach) {
        const startSkip = process.hrtime();
        await beforeEach();
        const endSkip = process.hrtime(startSkip);
        skip += (endSkip[0] * 1000 + endSkip[1] / 1000000);
      }
      await fn();
      if (afterEach) {
        const startSkip = process.hrtime();
        await afterEach();
        const endSkip = process.hrtime(startSkip);
        skip += (endSkip[0] * 1000 + endSkip[1] / 1000000);
      }
    }
    const end = process.hrtime(start);
    const duration = (end[0] * 1000 + end[1] / 1000000) / this.RUNS;

    if (!scanned) {
      return {
        duration: duration
      };
    }

    if (Array.isArray(scanned)) {
      return {
        duration: duration,
        items: scanned.length
      };
    }

    return {
      duration: duration,
      media: scanned.media.length,
      directories: scanned.directories.length
    };
  }

  private resetDB = async () => {
    await SQLConnection.close();
    await rimrafPR(this.dbFolder);
    Config.Server.Database.type = ServerConfig.DatabaseType.sqlite;
    Config.Server.Database.dbFolder = this.dbFolder;
    await ObjectManagers.InitSQLManagers();
  };

  private async setupDB() {
    const im = new BMIndexingManager();
    await this.resetDB();
    const dir = await DiskMangerWorker.scanDirectory('./');
    await im.saveToDB(dir);
  }

}
