export enum SearchTypes {
    image,
    directory,
    keyword,
    position
}

export class AutoCompleteItem {
    constructor(public text:string, public  type:SearchTypes) {
    }

    equals(other:AutoCompleteItem) {
        return this.text === other.text && this.type === other.type;
    }
}

