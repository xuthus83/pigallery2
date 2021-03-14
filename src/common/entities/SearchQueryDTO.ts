import {GPSMetadata} from './PhotoDTO';
import {Utils} from '../Utils';

export enum SearchQueryTypes {
  AND = 1, OR, SOME_OF, UNKNOWN_RELATION = 99999,

  // non-text metadata
  // |- range types
  from_date = 10,
  to_date,
  min_rating,
  max_rating,
  min_resolution,
  max_resolution,

  distance,
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
export const MinRangeSearchQueryTypes = [
  SearchQueryTypes.from_date,
  SearchQueryTypes.min_rating,
  SearchQueryTypes.min_resolution,
];
export const MaxRangeSearchQueryTypes = [
  SearchQueryTypes.to_date,
  SearchQueryTypes.max_rating,
  SearchQueryTypes.max_resolution
];

export const RangeSearchQueryTypes = MinRangeSearchQueryTypes.concat(MaxRangeSearchQueryTypes);

export const MetadataSearchQueryTypes = [
  SearchQueryTypes.distance,
  SearchQueryTypes.orientation
].concat(RangeSearchQueryTypes)
  .concat(TextSearchQueryTypes);

export const rangedTypePairs: any = {};
rangedTypePairs[SearchQueryTypes.from_date] = SearchQueryTypes.to_date;
rangedTypePairs[SearchQueryTypes.min_rating] = SearchQueryTypes.max_rating;
rangedTypePairs[SearchQueryTypes.min_resolution] = SearchQueryTypes.max_resolution;
// add the other direction too
for (const key of Object.keys(rangedTypePairs)) {
  rangedTypePairs[rangedTypePairs[key]] = key;
}

export enum TextSearchQueryMatchTypes {
  exact_match = 1, like = 2
}


export namespace SearchQueryDTO {
  export const getRangedQueryPair = (type: SearchQueryTypes): SearchQueryTypes => {
    if (rangedTypePairs[type]) {
      return rangedTypePairs[type];
    }
    throw new Error('Unknown ranged type');
  };
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

      case SearchQueryTypes.from_date:
      case SearchQueryTypes.to_date:
      case SearchQueryTypes.min_rating:
      case SearchQueryTypes.max_rating:
      case SearchQueryTypes.min_resolution:
      case SearchQueryTypes.max_resolution:
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

      default:
        throw new Error('Unknown type' + query.type);
    }
  };

  export const parse = (str: string, implicitOR = true): SearchQueryDTO => {
    console.log('parsing: ' + str);
    str = str.replace(/\s\s+/g, ' ') // remove double spaces
      .replace(/:\s+/g, ':').replace(/\)(?=\S)/g, ') ').trim();

    if (str.charAt(0) === '(' && str.charAt(str.length - 1) === ')') {
      str = str.slice(1, str.length - 1);
    }
    const fistSpace = (start = 0) => {
      const bracketIn = [];
      let quotationMark = false;
      for (let i = start; i < str.length; ++i) {
        if (str.charAt(i) === '"') {
          quotationMark = !quotationMark;
          continue;
        }
        if (str.charAt(i) === '(') {
          bracketIn.push(i);
          continue;
        }
        if (str.charAt(i) === ')') {
          bracketIn.pop();
          continue;
        }

        if (quotationMark === false &&
          bracketIn.length === 0 &&
          str.charAt(i) === ' ') {
          return i;
        }
      }
      return str.length - 1;
    };

    // tokenize
    const tokenEnd = fistSpace();

    if (tokenEnd !== str.length - 1) {
      if (str.startsWith(' and', tokenEnd)) {
        return <ANDSearchQuery>{
          type: SearchQueryTypes.AND,
          list: [SearchQueryDTO.parse(str.slice(0, tokenEnd), implicitOR), // trim brackets
            SearchQueryDTO.parse(str.slice(tokenEnd + 4), implicitOR)]
        };
      } else if (str.startsWith(' or', tokenEnd)) {
        return <ORSearchQuery>{
          type: SearchQueryTypes.OR,
          list: [SearchQueryDTO.parse(str.slice(0, tokenEnd), implicitOR), // trim brackets
            SearchQueryDTO.parse(str.slice(tokenEnd + 3), implicitOR)]
        };
      } else { // Relation cannot be detected
        return <SearchListQuery>{
          type: implicitOR === true ? SearchQueryTypes.OR : SearchQueryTypes.UNKNOWN_RELATION,
          list: [SearchQueryDTO.parse(str.slice(0, tokenEnd), implicitOR), // trim brackets
            SearchQueryDTO.parse(str.slice(tokenEnd), implicitOR)]
        };
      }
    }
    if (str.startsWith('some-of:') ||
      new RegExp(/^\d*-of:/).test(str)) {
      const prefix = str.startsWith('some-of:') ? 'some-of:' : new RegExp(/^\d*-of:/).exec(str)[0];
      let tmpList: any = SearchQueryDTO.parse(str.slice(prefix.length + 1, -1), false); // trim brackets
      //  console.log(JSON.stringify(tmpList, null, 4));
      const unfoldList = (q: SearchListQuery): SearchQueryDTO[] => {
        if (q.list) {
          if (q.type === SearchQueryTypes.UNKNOWN_RELATION) {
            return [].concat.apply([], q.list.map(e => unfoldList(<any>e))); // flatten array
          } else {
            q.list.forEach(e => unfoldList(<any>e));
          }
        }
        return [q];
      };
      tmpList = unfoldList(<SearchListQuery>tmpList);
      const ret = <SomeOfSearchQuery>{
        type: SearchQueryTypes.SOME_OF,
        list: tmpList
      };
      if (new RegExp(/^\d*-of:/).test(str)) {
        ret.min = parseInt(new RegExp(/^\d*/).exec(str)[0], 10);
      }
      return ret;
    }

    if (str.startsWith('from:')) {
      return <FromDateSearch>{
        type: SearchQueryTypes.from_date,
        value: Date.parse(str.slice('from:'.length + 1, str.length - 1))
      };
    }
    if (str.startsWith('to:')) {
      return <ToDateSearch>{
        type: SearchQueryTypes.to_date,
        value: Date.parse(str.slice('to:'.length + 1, str.length - 1))
      };
    }

    if (str.startsWith('min-rating:')) {
      return <MinRatingSearch>{
        type: SearchQueryTypes.min_rating,
        value: parseInt(str.slice('min-rating:'.length), 10)
      };
    }
    if (str.startsWith('max-rating:')) {
      return <MaxRatingSearch>{
        type: SearchQueryTypes.max_rating,
        value: parseInt(str.slice('max-rating:'.length), 10)
      };
    }
    if (str.startsWith('min-resolution:')) {
      return <MinResolutionSearch>{
        type: SearchQueryTypes.min_resolution,
        value: parseInt(str.slice('min-resolution:'.length), 10)
      };
    }
    if (str.startsWith('max-resolution:')) {
      return <MaxResolutionSearch>{
        type: SearchQueryTypes.max_resolution,
        value: parseInt(str.slice('max-resolution:'.length), 10)
      };
    }
    if (new RegExp(/^\d*-km-from:/).test(str)) {
      let from = str.slice(new RegExp(/^\d*-km-from:/).exec(str)[0].length);
      if (from.charAt(0) === '(' && from.charAt(from.length - 1) === ')') {
        from = from.slice(1, from.length - 1);
      }
      return <DistanceSearch>{
        type: SearchQueryTypes.distance,
        distance: parseInt(new RegExp(/^\d*/).exec(str)[0], 10),
        from: {text: from}
      };
    }

    if (str.startsWith('orientation:')) {
      return <OrientationSearch>{
        type: SearchQueryTypes.orientation,
        landscape: str.slice('orientation:'.length) === 'landscape'
      };
    }

    // parse text search
    const tmp = TextSearchQueryTypes.map(type => ({
      key: SearchQueryTypes[type] + ':',
      queryTemplate: <TextSearch>{type: type, text: ''}
    }));
    for (let i = 0; i < tmp.length; ++i) {
      if (str.startsWith(tmp[i].key)) {
        const ret: TextSearch = Utils.clone(tmp[i].queryTemplate);
        if (str.charAt(tmp[i].key.length) === '"' && str.charAt(str.length - 1) === '"') {
          ret.text = str.slice(tmp[i].key.length + 1, str.length - 1);
          ret.matchType = TextSearchQueryMatchTypes.exact_match;
        } else if (str.charAt(tmp[i].key.length) === '(' && str.charAt(str.length - 1) === ')') {
          ret.text = str.slice(tmp[i].key.length + 1, str.length - 1);
        } else {
          ret.text = str.slice(tmp[i].key.length);
        }
        return ret;
      }
    }


    return <TextSearch>{type: SearchQueryTypes.any_text, text: str};
  };

  export const stringify = (query: SearchQueryDTO): string => {
    if (!query || !query.type) {
      return '';
    }
    switch (query.type) {
      case SearchQueryTypes.AND:
        return '(' + (<SearchListQuery>query).list.map(q => SearchQueryDTO.stringify(q)).join(' and ') + ')';

      case SearchQueryTypes.OR:
        return '(' + (<SearchListQuery>query).list.map(q => SearchQueryDTO.stringify(q)).join(' or ') + ')';

      case SearchQueryTypes.SOME_OF:
        if ((<SomeOfSearchQuery>query).min) {
          return (<SomeOfSearchQuery>query).min + '-of:(' +
            (<SearchListQuery>query).list.map(q => SearchQueryDTO.stringify(q)).join(' ') + ')';
        }
        return 'some-of:(' +
          (<SearchListQuery>query).list.map(q => SearchQueryDTO.stringify(q)).join(' ') + ')';


      case SearchQueryTypes.orientation:
        return 'orientation:' + ((<OrientationSearch>query).landscape ? 'landscape' : 'portrait');

      case SearchQueryTypes.from_date:
        if (!(<FromDateSearch>query).value) {
          return '';
        }
        return 'from:(' + new Date((<FromDateSearch>query).value).toLocaleDateString() + ')'.trim();
      case SearchQueryTypes.to_date:
        if (!(<ToDateSearch>query).value) {
          return '';
        }
        return 'to:(' + new Date((<ToDateSearch>query).value).toLocaleDateString() + ')'.trim();
      case SearchQueryTypes.min_rating:
        return 'min-rating:' + (isNaN((<RangeSearch>query).value) ? '' : (<RangeSearch>query).value);
      case SearchQueryTypes.max_rating:
        return 'max-rating:' + (isNaN((<RangeSearch>query).value) ? '' : (<RangeSearch>query).value);
      case SearchQueryTypes.min_resolution:
        return 'min-resolution:' + (isNaN((<RangeSearch>query).value) ? '' : (<RangeSearch>query).value);
      case SearchQueryTypes.max_resolution:
        return 'max-resolution:' + (isNaN((<RangeSearch>query).value) ? '' : (<RangeSearch>query).value);
      case SearchQueryTypes.distance:
        if ((<DistanceSearch>query).from.text.indexOf(' ') !== -1) {
          return (<DistanceSearch>query).distance + '-km-from:(' + (<DistanceSearch>query).from.text + ')';
        }
        return (<DistanceSearch>query).distance + '-km-from:' + (<DistanceSearch>query).from.text;

      case SearchQueryTypes.any_text:
        if ((<TextSearch>query).matchType === TextSearchQueryMatchTypes.exact_match) {
          return '"' + (<TextSearch>query).text + '"';

        } else if ((<TextSearch>query).text.indexOf(' ') !== -1) {
          return '(' + (<TextSearch>query).text + ')';
        }
        return (<TextSearch>query).text;

      case SearchQueryTypes.person:
      case SearchQueryTypes.position:
      case SearchQueryTypes.keyword:
      case SearchQueryTypes.caption:
      case SearchQueryTypes.file_name:
      case SearchQueryTypes.directory:
        if (!(<TextSearch>query).text) {
          return '';
        }
        if ((<TextSearch>query).matchType === TextSearchQueryMatchTypes.exact_match) {
          return SearchQueryTypes[query.type] + ':"' + (<TextSearch>query).text + '"';

        } else if ((<TextSearch>query).text.indexOf(' ') !== -1) {
          return SearchQueryTypes[query.type] + ':(' + (<TextSearch>query).text + ')';
        }
        return SearchQueryTypes[query.type] + ':' + (<TextSearch>query).text;

      default:
        throw new Error('Unknown type: ' + query.type);
    }
  };
}

export interface SearchQueryDTO {
  type: SearchQueryTypes;
}


export interface NegatableSearchQuery extends SearchQueryDTO {
  negate?: boolean; // if true negates the expression
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


export interface RangeSearch extends NegatableSearchQuery {
  value: number;
}

export interface RangeSearchGroup extends ANDSearchQuery {
  list: RangeSearch[];
}

export interface FromDateSearch extends RangeSearch {
  type: SearchQueryTypes.from_date;
  value: number;
}

export interface ToDateSearch extends RangeSearch {
  type: SearchQueryTypes.to_date;
  value: number;
}

export interface MinRatingSearch extends RangeSearch {
  type: SearchQueryTypes.min_rating;
  value: number;
}

export interface MaxRatingSearch extends RangeSearch {
  type: SearchQueryTypes.max_rating;
  value: number;
}

export interface MinResolutionSearch extends RangeSearch {
  type: SearchQueryTypes.min_resolution;
  value: number; // in megapixels
}

export interface MaxResolutionSearch extends RangeSearch {
  type: SearchQueryTypes.max_resolution;
  value: number; // in megapixels
}

export interface OrientationSearch {
  type: SearchQueryTypes.orientation;
  landscape: boolean;
}

