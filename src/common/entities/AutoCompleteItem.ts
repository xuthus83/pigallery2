import {SearchQueryTypes} from './SearchQueryDTO';

export interface IAutoCompleteItem {
  text: string;
  type?: SearchQueryTypes;
}

export class AutoCompleteItem implements IAutoCompleteItem {
  constructor(public text: string, public type: SearchQueryTypes = null) {
  }

  equals(other: AutoCompleteItem) {
    return this.text === other.text && this.type === other.type;
  }
}

