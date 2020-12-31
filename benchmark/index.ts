import {Config} from '../src/common/config/private/Config';
import {ProjectPath} from '../src/backend/ProjectPath';
import {BenchmarkResult, BenchmarkRunner} from './BenchmarkRunner';
import {Utils} from '../src/common/Utils';
import {BMConfig} from './BMConfig';


Config.Server.Media.folder = BMConfig.path;
ProjectPath.reset();
const RUNS = BMConfig.RUNS;

let resultsText = '';
const printLine = (text: string) => {
  resultsText += text + '\n';
};


const printHeader = async (statistic: string) => {
  const dt = new Date();
  printLine('## PiGallery2 v' + require('./../package.json').version +
    ', ' + Utils.zeroPrefix(dt.getDate(), 2) +
    '.' + Utils.zeroPrefix(dt.getMonth() + 1, 2) +
    '.' + dt.getFullYear());
  printLine('**System**: ' + BMConfig.system);
  printLine('\n**Gallery**: ' + statistic + '\n');
};


const printTableHeader = () => {
  printLine('| Action | Sub action | Average Duration | Result  |');
  printLine('|:------:|:----------:|:----------------:|:-------:|');
};
const printResult = (result: BenchmarkResult, isSubResult = false) => {
  console.log('benchmarked: ' + result.name);
  let details = '-';
  if (result.items) {
    details = 'items: ' + result.items;
  }
  if (result.contentWrapper) {
    if (result.contentWrapper.directory) {
      details = 'media: ' + result.contentWrapper.directory.media.length +
        ', directories: ' + result.contentWrapper.directory.directories.length;
    } else {
      details = 'media: ' + result.contentWrapper.searchResult.media.length +
        ', directories: ' + result.contentWrapper.searchResult.directories.length;
    }
  }
  if (isSubResult) {
    printLine('| | ' + result.name + ' | ' + (result.duration).toFixed(1) + ' ms | ' + details + ' |');
  } else {
    printLine('| **' + result.name + '** | | **' + (result.duration).toFixed(1) + ' ms** | **' + details + '** |');
  }
  if (result.subBenchmarks && result.subBenchmarks.length > 1) {
    for (let i = 0; i < result.subBenchmarks.length; i++) {
      printResult(result.subBenchmarks[i], true);
    }
  }
};

const run = async () => {
  console.log('Running, RUNS:' + RUNS);
  const start = Date.now();
  const bm = new BenchmarkRunner(RUNS);

  // header
  await printHeader(await bm.getStatistic());
  printTableHeader();

  printResult(await bm.bmScanDirectory());
  printResult(await bm.bmSaveDirectory());
  printResult(await bm.bmListDirectory());
  printResult(await bm.bmListPersons());
  (await bm.bmAllSearch('a')).forEach(res => printResult(res.result));
  printResult(await bm.bmInstantSearch('a'));
  printResult(await bm.bmAutocomplete('a'));
  printLine('*Measurements run ' + RUNS + ' times and an average was calculated.');
  console.log(resultsText);
  console.log('run for : ' + ((Date.now() - start)).toFixed(1) + 'ms');
};

run().then(console.log).catch(console.error);

