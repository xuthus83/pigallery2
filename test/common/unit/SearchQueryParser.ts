import {expect} from 'chai';
import {
  ANDSearchQuery,
  DistanceSearch,
  FromDateSearch,
  MaxRatingSearch,
  MaxResolutionSearch,
  MinRatingSearch,
  MinResolutionSearch,
  OrientationSearch,
  ORSearchQuery,
  RangeSearch,
  SearchQueryDTO,
  SearchQueryTypes,
  SomeOfSearchQuery,
  TextSearch,
  TextSearchQueryMatchTypes,
  ToDateSearch
} from '../../../src/common/entities/SearchQueryDTO';
import {QueryKeywords, SearchQueryParser} from '../../../src/common/SearchQueryParser';

const queryKeywords: QueryKeywords = {
  NSomeOf: 'of',
  and: 'and',
  or: 'or',

  from: 'after',
  to: 'before',
  landscape: 'landscape',
  maxRating: 'max-rating',
  maxResolution: 'max-resolution',
  minRating: 'min-rating',
  minResolution: 'min-resolution',
  orientation: 'orientation',

  any_text: 'any-text',
  keyword: 'keyword',
  caption: 'caption',
  directory: 'directory',
  file_name: 'file-name',
  person: 'person',
  portrait: 'portrait',
  position: 'position',
  someOf: 'some-of',
  kmFrom: 'km-from'
};

describe('SearchQueryParser', () => {

  const check = (query: SearchQueryDTO) => {
    const parser = new SearchQueryParser(queryKeywords);
    expect(parser.parse(parser.stringify(query))).to.deep.equals(query, parser.stringify(query));

  };

  describe('should serialize and deserialize', () => {
    it('Text search', () => {
      check({type: SearchQueryTypes.any_text, text: 'test'} as TextSearch);
      check({type: SearchQueryTypes.person, text: 'person_test'} as TextSearch);
      check({type: SearchQueryTypes.directory, text: 'directory'} as TextSearch);
      check({type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch);
      check({type: SearchQueryTypes.caption, text: 'caption'} as TextSearch);
      check({type: SearchQueryTypes.file_name, text: 'filename'} as TextSearch);
      check({type: SearchQueryTypes.position, text: 'New York'} as TextSearch);
      check({
        type: SearchQueryTypes.position,
        matchType: TextSearchQueryMatchTypes.exact_match,
        text: 'New York'
      } as TextSearch);
      check({
        type: SearchQueryTypes.position,
        matchType: TextSearchQueryMatchTypes.exact_match,
        negate: true,
        text: 'New York'
      } as TextSearch);

      check({type: SearchQueryTypes.any_text, text: 'test', negate: true} as TextSearch);
    });

    it('Date search', () => {
      check({type: SearchQueryTypes.from_date, value: (new Date(2020, 1, 10)).getTime()} as FromDateSearch);
      check({type: SearchQueryTypes.from_date, value: (new Date(2020, 1, 1)).getTime()} as FromDateSearch);
      check({type: SearchQueryTypes.to_date, value: (new Date(2020, 1, 20)).getTime()} as ToDateSearch);
      check({type: SearchQueryTypes.to_date, value: (new Date(2020, 1, 1)).getTime()} as ToDateSearch);
      check({type: SearchQueryTypes.from_date, value: (new Date(2020, 1, 1)).getTime(), negate: true} as FromDateSearch);
      check({type: SearchQueryTypes.to_date, value: (new Date(2020, 1, 1)).getTime(), negate: true} as ToDateSearch);

      const parser = new SearchQueryParser(queryKeywords);
      // test if date gets simplified on 1st of Jan.
      let query: RangeSearch = {type: SearchQueryTypes.to_date, value: (new Date(2020, 0, 1)).getTime()} as ToDateSearch;
      expect(parser.parse(queryKeywords.to + ':' + (new Date(query.value)).getFullYear()))
        .to.deep.equals(query, parser.stringify(query));

      query = ({type: SearchQueryTypes.from_date, value: (new Date(2020, 0, 1)).getTime()} as FromDateSearch);
      expect(parser.parse(queryKeywords.from + ':' + (new Date(query.value)).getFullYear()))
        .to.deep.equals(query, parser.stringify(query));

    });
    it('Rating search', () => {
      check({type: SearchQueryTypes.min_rating, value: 10} as MinRatingSearch);
      check({type: SearchQueryTypes.max_rating, value: 1} as MaxRatingSearch);
      check({type: SearchQueryTypes.min_rating, value: 10, negate: true} as MinRatingSearch);
      check({type: SearchQueryTypes.max_rating, value: 1, negate: true} as MaxRatingSearch);
    });
    it('Resolution search', () => {
      check({type: SearchQueryTypes.min_resolution, value: 10} as MinResolutionSearch);
      check({type: SearchQueryTypes.max_resolution, value: 5} as MaxResolutionSearch);
      check({type: SearchQueryTypes.min_resolution, value: 10, negate: true} as MinResolutionSearch);
      check({type: SearchQueryTypes.max_resolution, value: 5, negate: true} as MaxResolutionSearch);
    });
    it('Distance search', () => {
      check({type: SearchQueryTypes.distance, distance: 10, from: {text: 'New York'}} as DistanceSearch);
      check({type: SearchQueryTypes.distance, distance: 10, from: {text: 'New York'}, negate: true} as DistanceSearch);
    });
    it('OrientationSearch search', () => {
      check({type: SearchQueryTypes.orientation, landscape: true} as OrientationSearch);
      check({type: SearchQueryTypes.orientation, landscape: false} as OrientationSearch);
    });
    it('Default logical operator should be AND', () => {

      const parser = new SearchQueryParser(queryKeywords);
      expect(parser.parse('a b')).to.deep.equals({
        type: SearchQueryTypes.AND,
        list: [
          {type: SearchQueryTypes.any_text, text: 'a'} as TextSearch,
          {type: SearchQueryTypes.any_text, text: 'b'} as TextSearch
        ]
      } as ANDSearchQuery);
    });
    it('And search', () => {
      check({
        type: SearchQueryTypes.AND,
        list: [
          {type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch,
          {type: SearchQueryTypes.position, text: 'New York'} as TextSearch
        ]
      } as ANDSearchQuery);

      check({
        type: SearchQueryTypes.AND,
        list: [
          {type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch,
          {
            type: SearchQueryTypes.position,
            matchType: TextSearchQueryMatchTypes.exact_match,
            text: 'New York'
          } as TextSearch
        ]
      } as ANDSearchQuery);
      check({
        type: SearchQueryTypes.AND,
        list: [
          {type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch,
          {type: SearchQueryTypes.caption, text: 'caption'} as TextSearch,
          {type: SearchQueryTypes.position, text: 'New York'} as TextSearch
        ]
      } as ANDSearchQuery);
      check({
        type: SearchQueryTypes.AND,
        list: [
          {
            type: SearchQueryTypes.SOME_OF,
            min: 2,
            list: [
              {type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch,
              {type: SearchQueryTypes.position, text: 'New York'} as TextSearch,
              {type: SearchQueryTypes.caption, text: 'caption test'} as TextSearch
            ]
          } as SomeOfSearchQuery,
          {type: SearchQueryTypes.position, text: 'New York'} as TextSearch
        ]
      } as ANDSearchQuery);
    });
    it('Or search', () => {
      check({
        type: SearchQueryTypes.OR,
        list: [
          {type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch,
          {type: SearchQueryTypes.position, text: 'New York'} as TextSearch
        ]
      } as ORSearchQuery);
      check({
        type: SearchQueryTypes.OR,
        list: [
          {type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch,
          {type: SearchQueryTypes.person, text: 'person_test'} as TextSearch,
          {type: SearchQueryTypes.position, text: 'New York'} as TextSearch
        ]
      } as ORSearchQuery);
    });
    it('Some of search', () => {
      check({
        type: SearchQueryTypes.SOME_OF,
        list: [
          {type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch,
          {type: SearchQueryTypes.position, text: 'New York'} as TextSearch
        ]
      } as SomeOfSearchQuery);
      check({
        type: SearchQueryTypes.SOME_OF,
        list: [
          {
            type: SearchQueryTypes.keyword,
            matchType: TextSearchQueryMatchTypes.exact_match,
            text: 'big boom'
          } as TextSearch,
          {
            type: SearchQueryTypes.position,
            matchType: TextSearchQueryMatchTypes.exact_match,
            text: 'New York'
          } as TextSearch,
        ]
      } as SomeOfSearchQuery);
      check({
        type: SearchQueryTypes.SOME_OF,
        min: 2,
        list: [
          {type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch,
          {type: SearchQueryTypes.position, text: 'New York'} as TextSearch,
          {type: SearchQueryTypes.caption, text: 'caption test'} as TextSearch
        ]
      } as SomeOfSearchQuery);
      check({
        type: SearchQueryTypes.SOME_OF,
        min: 2,
        list: [
          {type: SearchQueryTypes.keyword, text: 'big boom'} as TextSearch,
          {type: SearchQueryTypes.person, text: 'person_test'} as TextSearch,
          {
            type: SearchQueryTypes.AND,
            list: [
              {type: SearchQueryTypes.caption, text: 'caption'} as TextSearch,
              {type: SearchQueryTypes.position, text: 'New York'} as TextSearch
            ]
          } as ANDSearchQuery
        ]
      } as SomeOfSearchQuery);
    });
  });


});
