import {SearchQueryTypes} from './SearchQueryDTO';

export class AutoCompleteItem {
  constructor(public text: string, public type: SearchQueryTypes = null) {
  }

  equals(other: AutoCompleteItem) {
    return this.text === other.text && this.type === other.type;
  }
}

