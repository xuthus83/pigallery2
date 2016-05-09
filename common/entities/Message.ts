import {Error} from "./Error";

export class Message<T> {
    public error:Error = null;
    public result:T = null;

    constructor(error:Error, result:T) {
        this.error = error;
        this.result = result;
    }
}