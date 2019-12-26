export enum JobLastRunState {
  finished = 1, canceled = 2
}

export interface JobLastRunDTO {
  config: any;
  done: number;
  all: number;
  state: JobLastRunState;
  comment: string;
  time: {
    start: number,
    end: number
  };
}
