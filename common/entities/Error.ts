
export enum ErrorCodes{
    NOT_AUTHENTICATED,
    ALREADY_AUTHENTICATED
}

export class Error{
    constructor(public code:ErrorCodes, public message?:String) {}
}