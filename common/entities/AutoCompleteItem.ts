export enum SearchTypes {
    directory = 1,
    keyword = 2,
    position = 3,
    image = 4
}

export class AutoCompleteItem {
    constructor(public text:string, public type:SearchTypes) {
    }

    equals(other:AutoCompleteItem) {
        return this.text === other.text && this.type === other.type;
    }
}

