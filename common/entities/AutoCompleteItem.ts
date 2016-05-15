export enum AutoCompeleteTypes {
    image,
    directory,
    keyword,
    position
}

export class AutoCompleteItem {
    constructor(public text:string, public  type:AutoCompeleteTypes) {
    }

    equals(other:AutoCompleteItem) {
        return this.text === other.text && this.type === other.type;
    }
}

