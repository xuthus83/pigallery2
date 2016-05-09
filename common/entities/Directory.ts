import {Photo} from "./Photo";
export class Directory {

    constructor(public id?:number,
                public name?:string,
                public path?:string,
                public lastUpdate?:Date,
                public directories:Array<Directory> = [],
                public photos:Array<Photo> = []) {
    }
}