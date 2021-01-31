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
  caption,
  directory,
  file_name,
  keyword,
  person,
  position,
}

export const ListSearchQueryTypes = [
  SearchQueryTypes.AND,
  SearchQueryTypes.OR,
  SearchQueryTypes.SOME_OF,
];
export const TextSearchQueryTypes = [
  SearchQueryTypes.any_text,
  SearchQueryTypes.caption,
  SearchQueryTypes.directory,
  SearchQueryTypes.file_name,
  SearchQueryTypes.keyword,
  SearchQueryTypes.person,
  SearchQueryTypes.position,
];

export const MetadataSearchQueryTypes = [
  // non-text metadata
  SearchQueryTypes.date,
  SearchQueryTypes.rating,
  SearchQueryTypes.distance,
  SearchQueryTypes.resolution,
  SearchQueryTypes.orientation,

  // TEXT search types
  SearchQueryTypes.any_text,
  SearchQueryTypes.caption,
  SearchQueryTypes.directory,
  SearchQueryTypes.file_name,
  SearchQueryTypes.keyword,
  SearchQueryTypes.person,
  SearchQueryTypes.position,
];

export enum TextSearchQueryMatchTypes {
  exact_match = 1, like = 2
}


export namespace SearchQueryDTO {
  export const negate = (query: SearchQueryDTO): SearchQueryDTO => {
    switch (query.type) {
      case SearchQueryTypes.AND:
        query.type = SearchQueryTypes.OR;
        (<SearchListQuery>query).list = (<SearchListQuery>query).list.map(q => SearchQueryDTO.negate(q));
        return query;
      case SearchQueryTypes.OR:
        query.type = SearchQueryTypes.AND;
        (<SearchListQuery>query).list = (<SearchListQuery>query).list.map(q => SearchQueryDTO.negate(q));
        return query;

      case SearchQueryTypes.orientation:
        (<OrientationSearch>query).landscape = !(<OrientationSearch>query).landscape;
        return query;

      case SearchQueryTypes.date:
      case SearchQueryTypes.rating:
      case SearchQueryTypes.resolution:
      case SearchQueryTypes.distance:
      case SearchQueryTypes.any_text:
      case SearchQueryTypes.person:
      case SearchQueryTypes.position:
      case SearchQueryTypes.keyword:
      case SearchQueryTypes.caption:
      case SearchQueryTypes.file_name:
      case SearchQueryTypes.directory:
        (<NegatableSearchQuery>query).negate = !(<NegatableSearchQuery>query).negate;
        return query;

      case SearchQueryTypes.SOME_OF:
        throw new Error('Some of not supported');
    }
  };
}

export interface SearchQueryDTO {
  type: SearchQueryTypes;
}


export interface NegatableSearchQuery extends SearchQueryDTO {
  negate?: boolean; // if true negates the expression
}

export interface RangeSearchQuery extends SearchQueryDTO {
  min?: number;
  max?: number;
}

export interface SearchListQuery extends SearchQueryDTO {
  list: SearchQueryDTO[];
}


export interface ANDSearchQuery extends SearchQueryDTO, SearchListQuery {
  type: SearchQueryTypes.AND;
  list: SearchQueryDTO[];
}

export interface ORSearchQuery extends SearchQueryDTO, SearchListQuery {
  type: SearchQueryTypes.OR;
  list: SearchQueryDTO[];
}

export interface SomeOfSearchQuery extends SearchQueryDTO, SearchListQuery {
  type: SearchQueryTypes.SOME_OF;
  list: NegatableSearchQuery[];
  min?: number; // at least this amount of items
}

export interface TextSearch extends NegatableSearchQuery {
  type: SearchQueryTypes.any_text |
    SearchQueryTypes.person |
    SearchQueryTypes.keyword |
    SearchQueryTypes.position |
    SearchQueryTypes.caption |
    SearchQueryTypes.file_name |
    SearchQueryTypes.directory;
  matchType: TextSearchQueryMatchTypes;
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

export interface RatingSearch extends RangeSearchQuery, NegatableSearchQuery {
  type: SearchQueryTypes.rating;
  min?: number;
  max?: number;
}

export interface ResolutionSearch extends RangeSearchQuery, NegatableSearchQuery {
  type: SearchQueryTypes.resolution;
  min?: number; // in megapixels
  max?: number; // in megapixels
}

export interface OrientationSearch {
  type: SearchQueryTypes.orientation;
  landscape: boolean;
}

