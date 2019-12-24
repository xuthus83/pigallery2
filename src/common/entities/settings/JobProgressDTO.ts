export enum JobState {
  idle = 1, running = 2, stopping = 3
}


export interface JobProgressDTO {
  progress: number;
  left: number;
  state: JobState;
  comment: string;
  time: {
    start: number,
    current: number
  };
}
