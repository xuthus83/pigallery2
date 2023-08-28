import {SortingByTypes, SortingMethod} from './entities/SortingMethods';

/**
 * This contains the action of the supported list of *.pg2conf files.
 * These files are passed down to the client as metaFiles (like photos and directories)
 */
export const PG2ConfMap = {
  sorting: {
    '.order_descending_name.pg2conf': {method: SortingByTypes.Name, ascending: false} as SortingMethod,
    '.order_ascending_name.pg2conf': {method: SortingByTypes.Name, ascending: true} as SortingMethod,
    '.order_descending_date.pg2conf': {method: SortingByTypes.Date, ascending: false} as SortingMethod,
    '.order_ascending_date.pg2conf': {method: SortingByTypes.Date, ascending: true} as SortingMethod,
    '.order_descending_rating.pg2conf': {method: SortingByTypes.Rating, ascending: false} as SortingMethod,
    '.order_ascending_rating.pg2conf': {method: SortingByTypes.Rating, ascending: true} as SortingMethod,
    '.order_random.pg2conf': {method: SortingByTypes.Rating, ascending: null} as SortingMethod,
    '.order_descending_person_count.pg2conf': {method: SortingByTypes.PersonCount, ascending: false} as SortingMethod,
    '.order_ascending_person_count.pg2conf': {method: SortingByTypes.PersonCount, ascending: true} as SortingMethod,
  },
};

/**
 * These files are processed on the server side,
 * do not get passed down to the client or saved to the DB
 */

export enum ServerSidePG2ConfAction {
  // Enum always starts from 1 as !!0 === false
  SAVED_SEARCH = 1,
}

export const ServerPG2ConfMap: { [key: string]: ServerSidePG2ConfAction } = {
  '.saved_searches.pg2conf': ServerSidePG2ConfAction.SAVED_SEARCH,
};

