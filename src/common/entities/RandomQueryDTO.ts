export enum OrientationType {
  any = 0, portrait = 1, landscape = 2
}

// TODO replace it with advanced search
export interface RandomQueryDTO {
  directory?: string;
  recursive?: boolean;
  orientation?: OrientationType;
  fromDate?: string;
  toDate?: string;
  minResolution?: number;
  maxResolution?: number;
}
