import {Config} from '../src/common/config/private/Config';
import {ProjectPath} from '../src/backend/ProjectPath';
import {BenchmarkResult, BenchmarkRunner} from './BenchmarkRunner';
import {SearchTypes} from '../src/common/entities/AutoCompleteItem';
import {Utils} from '../src/common/Utils';
import {DiskMangerWorker} from '../src/backend/model/threading/DiskMangerWorker';
import {BMConfig} from './BMConfig';
import {GalleryManager} from '../src/backend/model/database/sql/GalleryManager';
import {PersonManager} from '../src/backend/model/database/sql/PersonManager';


Config.Server.Media.folder = BMConfig.path;
ProjectPath.reset();
const RUNS = BMConfig.RUNS;

let resultsText = '';
const printLine = (text: string) => {
  resultsText += text + '\n';
};

const printHeader = async () => {
  const dt = new Date();
  printLine('## PiGallery2 v' + require('./../package.json').version +
    ', ' + Utils.zeroPrefix(dt.getDate(), 2) +
    '.' + Utils.zeroPrefix(dt.getMonth() + 1, 2) +
    '.' + dt.getFullYear());
  printLine('**System**: ' + BMConfig.system);
  const dir = await DiskMangerWorker.scanDirectory('./');
  const gm = new GalleryManager();
  const pm = new PersonManager();
  printLine('\n**Gallery**: directories: ' +
    dir.directories.length +
    ' media: ' + dir.media.length +
    // @ts-ignore
    ', all persons: ' + dir.media.reduce((p, c) => p + (c.metadata.faces || []).length, 0) +
    ',unique persons (faces): ' + (await pm.getAll()).length + '\n');
};


const printTableHeader = () => {
  printLine('| Action | Sub action | Action details | Average Duration | Details |');
  printLine('|:------:|:----------:|:--------------:|:----------------:|:-------:|');
};
const printResult = (result: BenchmarkResult, actionDetails: string = '', isSubResult = false) => {
  console.log('benchmarked: ' + result.name);
  let details = '-';
  if (result.items) {
    details = 'items: ' + result.items;
  }
  if (result.contentWrapper) {
    if (result.contentWrapper.directory) {
      details = 'media: ' + result.contentWrapper.directory.media.length +
        ', directories:' + result.contentWrapper.directory.directories.length;
    } else {
      details = 'media: ' + result.contentWrapper.searchResult.media.length +
        ', directories:' + result.contentWrapper.searchResult.directories.length;
    }
  }
  if (isSubResult) {
    printLine('| | ' + result.name + ' | ' + actionDetails +
      ' | ' + (result.duration).toFixed(1) + ' ms | ' + details + ' |');
  } else {
    printLine('| **' + result.name + '** | | ' + actionDetails +
      ' | ' + (result.duration).toFixed(1) + ' ms | ' + details + ' |');
  }
  if (result.subBenchmarks && result.subBenchmarks.length > 1) {
    for (let i = 0; i < result.subBenchmarks.length; i++) {
      printResult(result.subBenchmarks[i], '', true);
    }
  }
};

const run = async () => {
  console.log('Running, RUNS:' + RUNS);
  const start = Date.now();
  const bm = new BenchmarkRunner(RUNS);

  // header
  await printHeader();
  printTableHeader();

  printResult(await bm.bmScanDirectory());
  printResult(await bm.bmSaveDirectory());
  printResult(await bm.bmListDirectory());
  printResult(await bm.bmListPersons());
  (await bm.bmAllSearch('a')).forEach(res => {
    if (res.searchType !== null) {
      printResult(res.result, '`a` as `' + SearchTypes[res.searchType] + '`');
    } else {
      printResult(res.result, '`a` as `any`');
    }
  });
  printResult(await bm.bmInstantSearch('a'), '`a`');
  printResult(await bm.bmAutocomplete('a'), '`a`');
  printLine('*Measurements run ' + RUNS + ' times and an average was calculated.');
  console.log(resultsText);
  console.log('run for : ' + ((Date.now() - start)).toFixed(1) + 'ms');
};

run().then(console.log).catch(console.error);

