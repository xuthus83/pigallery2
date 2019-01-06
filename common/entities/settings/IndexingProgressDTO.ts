export interface IndexingProgressDTO {
  indexed: number;
  left: number;
  current: string;
  time: {
    start: number,
    current: number
  };
}
