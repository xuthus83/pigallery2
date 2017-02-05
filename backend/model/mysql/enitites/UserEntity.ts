import {UserDTO, UserRoles} from "../../../../common/entities/UserDTO";
import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
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