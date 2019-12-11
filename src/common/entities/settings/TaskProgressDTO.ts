export enum TaskState {
  idle = 1, running = 2, stopping = 3
}


export interface TaskProgressDTO {
  progress: number;
  left: number;
  state: TaskState;
  comment: string;
  time: {
    start: number,
    current: number
  };
}
