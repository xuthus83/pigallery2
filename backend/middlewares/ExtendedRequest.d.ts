
declare module Express {
    export interface Request{
        resultPipe?:any
        body?:{
            loginCredential
        }
    }       
    
    export interface Session  {
        user?;
    }
}

