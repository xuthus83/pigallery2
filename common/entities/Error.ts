export enum ErrorCodes{
    NOT_AUTHENTICATED,
    ALREADY_AUTHENTICATED,
    NOT_AUTHORISED,
    CREDENTIAL_NOT_FOUND,


    USER_CREATION_ERROR,


    GENERAL_ERROR,
    SERVER_ERROR

}

export class Error {
    constructor(public code:ErrorCodes, public message?:String) {
    }
}