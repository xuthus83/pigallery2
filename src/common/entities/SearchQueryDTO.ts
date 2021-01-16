import {GPSMetadata} from './PhotoDTO';

export enum SearchQueryTypes {
  AND = 1, OR, SOME_OF,

  // non-text metadata
  date = 10,
  rating,
  distance,
  resolution,
  orientation,

  // TEXT search types
  any_text = 100,
  person,
  keyword,
  position,
  caption,
  file_name,
  directory,
}

export enum TextSearchQueryTypes {
  exact_match = 1, like = 2
}

export enum OrientationSearchTypes {
  portrait = 1, landscape = 2
}

export interface SearchQueryDTO {
  type: SearchQueryTypes;
}

export interface ANDSearchQuery extends SearchQueryDTO {
  type: SearchQueryTypes.AND;
  list: SearchQueryDTO[];
}

export interface ORSearchQuery extends SearchQueryDTO {
  type: SearchQueryTypes.OR;
  list: SearchQueryDTO[];
}

export interface SomeOfSearchQuery extends SearchQueryDTO, RangeSearchQuery {
  type: SearchQueryTypes.SOME_OF;
  list: NegatableSearchQuery[];
  min?: number; // at least this amount of items
  max?: number; // maximum this amount of items
}

export interface NegatableSearchQuery extends SearchQueryDTO {
  negate?: boolean; // if true negates the expression
}

export interface RangeSearchQuery extends SearchQueryDTO {
  min?: number;
  max?: number;
}


export interface TextSearch extends NegatableSearchQuery {
  type: SearchQueryTypes.any_text |
    SearchQueryTypes.person |
    SearchQueryTypes.keyword |
    SearchQueryTypes.position |
    SearchQueryTypes.caption |
    SearchQueryTypes.file_name |
    SearchQueryTypes.directory;
  matchType: TextSearchQueryTypes;
  text: string;
}

export interface DistanceSearch extends NegatableSearchQuery {
  type: SearchQueryTypes.distance;
  from: {
    text?: string;
    GPSData?: GPSMetadata;
  };
  distance: number; // in kms
}


export interface DateSearch extends NegatableSearchQuery {
  type: SearchQueryTypes.date;
  after?: number;
  before?: number;
}

export interface RatingSearch extends NegatableSearchQuery, RangeSearchQuery {
  type: SearchQueryTypes.rating;
  min?: number;
  max?: number;
}

export interface ResolutionSearch extends NegatableSearchQuery, RangeSearchQuery {
  type: SearchQueryTypes.resolution;
  min?: number; // in megapixels
  max?: number; // in megapixels
}

export interface OrientationSearch extends NegatableSearchQuery {
  type: SearchQueryTypes.orientation;
  orientation: OrientationSearchTypes;
}

