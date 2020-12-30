import {BenchmarkResult} from './BenchmarkRunner';
import {ContentWrapper} from '../src/common/entities/ConentWrapper';

export interface BenchmarkStep {
  name: string;
  fn: ((input?: any) => Promise<ContentWrapper | any[] | void>);
}

export class Benchmark {


  steps: BenchmarkStep[] = [];
  name: string;
  inputCB: () => any;
  beforeEach: () => Promise<any>;
  afterEach: () => Promise<any>;


  constructor(name: string,
              inputCB?: () => any,
              beforeEach?: () => Promise<any>,
              afterEach?: () => Promise<any>) {
    this.name = name;
    this.inputCB = inputCB;
    this.beforeEach = beforeEach;
    this.afterEach = afterEach;
  }

  async run(RUNS: number): Promise<BenchmarkResult> {
    console.log('Running benchmark: ' + this.name);
    const scanned = await this.scanSteps();
    const start = process.hrtime();
    let skip = 0;
    const stepTimer = new Array(this.steps.length).fill(0);
    for (let i = 0; i < RUNS; i++) {
      if (this.beforeEach) {
        const startSkip = process.hrtime();
        await this.beforeEach();
        const endSkip = process.hrtime(startSkip);
        skip += (endSkip[0] * 1000 + endSkip[1] / 1000000);
      }
      await this.runOneRound(stepTimer);
      if (this.afterEach) {
        const startSkip = process.hrtime();
        await this.afterEach();
        const endSkip = process.hrtime(startSkip);
        skip += (endSkip[0] * 1000 + endSkip[1] / 1000000);
      }
    }
    const end = process.hrtime(start);
    const duration = (end[0] * 1000 + end[1] / 1000000 - skip) / RUNS;


    const ret = this.outputToBMResult(this.name, scanned[scanned.length - 1]);
    ret.duration = duration;
    ret.subBenchmarks = scanned.map((o, i) => {
        const stepBm = this.outputToBMResult(this.steps[i].name, o);
        stepBm.duration = stepTimer[i] / RUNS;
        return stepBm;
      }
    );

    return ret;
  }

  outputToBMResult(name: string, output: any[] | ContentWrapper): BenchmarkResult {
    if (output) {
      if (Array.isArray(output)) {
        return {
          name: name,
          duration: null,
          items: output.length,
        };
      }

      if (output.directory || output.searchResult) {
        return {
          name: name,
          duration: null,
          contentWrapper: output
        };
      }

    }
    return {
      name: name,
      duration: null
    };
  }

  async scanSteps(): Promise<any[]> {
    let pipe = this.inputCB ? this.inputCB() : null;
    const stepOutput = new Array(this.steps.length);

    for (let j = 0; j < this.steps.length; ++j) {
      if (this.beforeEach) {
        await this.beforeEach();
      }
      for (let i = 0; i <= j; ++i) {
        pipe = await this.steps[i].fn(pipe);
      }
      stepOutput[j] = pipe;
      if (this.afterEach) {
        await this.afterEach();
      }
    }
    return stepOutput;
  }

  async runOneRound(stepTimer: number[]): Promise<number[]> {
    let pipe = this.inputCB ? this.inputCB() : null;
    for (let i = 0; i < this.steps.length; ++i) {
      const start = process.hrtime();
      pipe = await this.steps[i].fn(pipe);
      const end = process.hrtime(start);
      stepTimer[i] += (end[0] * 1000 + end[1] / 1000000);
    }
    return stepTimer;
  }

  addAStep(step: BenchmarkStep) {
    this.steps.push(step);
  }

}
