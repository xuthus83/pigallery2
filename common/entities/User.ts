
export enum UserRoles{
    Guest = 1,
    User = 2,
    Admin = 3,
    Developer = 4,
  
}

export class User { 
    constructor(public id?:number,public name?:string,public email?:string, public password?:string, public role?:UserRoles){}
}