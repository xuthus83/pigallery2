import {UserDTO, UserRoles} from "../../../../common/entities/UserDTO";
import {Table, Column, PrimaryGeneratedColumn} from "typeorm";

@Table()
export class UserEntity implements UserDTO {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 500
    })
    name: string;

    @Column({
        length: 500
    })
    password: string;

    @Column("int")
    role: UserRoles;

}