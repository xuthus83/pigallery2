import {Photo} from "./Photo";
export class Directory{
    
    constructor(public id?:string,
                public name?:string,
                public path?:string,
                public lastUpdate?:Date,
                public directories:Array<Directory>  = [],
                public photos:Array<Photo> = []){}
}