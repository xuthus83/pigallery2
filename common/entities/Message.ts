import {Error} from "./Error";

export class Message<T>{
    constructor(public error:Error,public result:T){}
}