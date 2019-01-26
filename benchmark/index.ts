import {Config} from '../common/config/private/Config';
import * as path from 'path';
import {ProjectPath} from '../backend/ProjectPath';
import {BenchmarkResult, Benchmarks} from './Benchmarks';
import {SearchTypes} from '../common/entities/AutoCompleteItem';
import {Utils} from '../common/Utils';
import {DiskMangerWorker} from '../backend/model/threading/DiskMangerWorker';

const config: { path: string, system: string } = require(path.join(__dirname, 'config.json'));
Config.Server.imagesFolder = config.path;
const dbPath = path.join(__dirname, 'test.db');
ProjectPath.reset();
const RUNS = 1;

let resultsText = '';
const printLine = (text: string) => {
  resultsText += text + '\n';
};

const printHeader = async () => {
  const dt = new Date();
  printLine('## PiGallery2 v' + require('./../package.json').version +
    ', ' + Utils.zeroPrefix(dt.getDay(), 2) +
    '.' + Utils.zeroPrefix(dt.getMonth() + 1, 2) +
    '.' + dt.getFullYear());
  printLine('**System**: ' + config.system);
  const dir = await DiskMangerWorker.scanDirectory('./');
  printLine('**Gallery**: directories:' + dir.directories.length + ' media:' + dir.media.length);
};


const printTableHeader = () => {
  printLine('| action | action details | average time | details |');
  printLine('|:------:|:--------------:|:------------:|:-------:|');
};
const printResult = (result: BenchmarkResult, action: string, actionDetails: string = '') => {
  let details = '-';
  if (result.items) {
    details = 'items: ' + result.items;
  }
  if (result.media) {
    details = 'media: ' + result.media + ', directories:' + result.directories;
  }
  printLine('| ' + action + ' | ' + actionDetails +
    ' | ' + (result.duration / 1000).toFixed(2) + 's | ' + details + ' |');
};

const run = async () => {
  const bm = new Benchmarks(RUNS, dbPath);

  // header
  await printHeader();
  printTableHeader();
  printResult(await bm.bmScanDirectory(), 'Scanning directory');
  printResult(await bm.bmSaveDirectory(), 'Saving directory');
  printResult(await bm.bmListDirectory(), 'Listing Directory');
  (await bm.bmAllSearch('a')).forEach(res => {
    if (res.searchType !== null) {
      printResult(res.result, 'searching', '`a` as `' + SearchTypes[res.searchType] + '`');
    } else {
      printResult(res.result, 'searching', '`a` as `any`');
    }
  });
  printResult(await bm.bmInstantSearch('a'), 'instant search', '`a`');
  printResult(await bm.bmAutocomplete('a'), 'auto complete', '`a`');
  console.log(resultsText);
};

run();

