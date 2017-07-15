declare module Express {
  export interface Request {
    resultPipe?: any
    body?: {
      loginCredential
    }
  }

  export interface Response {
    tpl?: any
  }

  export interface Session {
    user?;
  }
}

