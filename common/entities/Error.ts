export enum ErrorCodes{
  NOT_AUTHENTICATED = 0,
  ALREADY_AUTHENTICATED = 1,
  NOT_AUTHORISED = 2,
  PERMISSION_DENIED = 3,
  CREDENTIAL_NOT_FOUND = 4,


  USER_CREATION_ERROR = 5,


  GENERAL_ERROR = 6,
  THUMBNAIL_GENERATION_ERROR = 7,
  SERVER_ERROR = 8,

  USER_MANAGEMENT_DISABLED = 9,

  INPUT_ERROR = 10,

  SETTINGS_ERROR = 11
}

export class Error {
  constructor(public code: ErrorCodes, public message?: string, public details?: any) {
  }
}
