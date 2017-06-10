export enum UserRoles{
  Guest = 1,
  User = 2,
  Admin = 3,
  Developer = 4,

}

export interface UserDTO {
  id: number;
  name: string;
  password: string;
  role: UserRoles;
}
