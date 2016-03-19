import {Error} from "./Error";

export class Message<T>{
    constructor(public errors:Error,public result:T){}
}