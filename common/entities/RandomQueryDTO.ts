export enum OrientationType {
  any = 0, portrait = 1, landscape = 2
}

export interface RandomQueryDTO {
  directory?: string;
  recursive?: boolean;
  orientation?: OrientationType;
  fromDate?: string;
  toDate?: string;
  minResolution?: number;
  maxResolution?: number;
}
