export enum AutoCompeleteTypes {
    image,
    directory,
    imageTag
}

export class AutoCompleteItem {
    constructor(public text:string, public  type:AutoCompeleteTypes) {
    }
}

