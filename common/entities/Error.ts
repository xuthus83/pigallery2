export enum ErrorCodes{
    NOT_AUTHENTICATED = 0,
    ALREADY_AUTHENTICATED = 1,
    NOT_AUTHORISED = 2,
    CREDENTIAL_NOT_FOUND = 3,


    USER_CREATION_ERROR = 4,


    GENERAL_ERROR = 5,
    THUMBNAIL_GENERATION_ERROR = 6,
    SERVER_ERROR = 7,

    USER_MANAGEMENT_DISABLED = 8

}

export class Error {
    constructor(public code: ErrorCodes, public message?: string) {
    }
}