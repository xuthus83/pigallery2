export enum SearchTypes {
  directory = 1,
  keyword = 2,
  position = 3,
  photo = 4,
  video = 5
}

export class AutoCompleteItem {
  constructor(public text: string, public type: SearchTypes) {
  }

  equals(other: AutoCompleteItem) {
    return this.text === other.text && this.type === other.type;
  }
}

