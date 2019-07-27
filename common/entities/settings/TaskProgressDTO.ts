export interface TaskProgressDTO {
  progress: number;
  left: number;
  comment: string;
  time: {
    start: number,
    current: number
  };
}
