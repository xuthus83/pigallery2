export enum JobProgressStates {
  running = 1, cancelling = 2, interrupted = 3, canceled = 4, finished = 5
}


export interface JobProgressDTO {
  HashName: string;
  steps: {
    all: number,
    processed: number,
    skipped: number,
  };
  state: JobProgressStates;
  logs: string[];
  time: {
    start: number,
    end: number
  };
}
