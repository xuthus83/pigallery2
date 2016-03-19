import {Error} from "./Error";

export class Message<T>{
    constructor(public errors:Array<Error>,public result:T){}
}