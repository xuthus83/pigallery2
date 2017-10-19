import {UserDTO, UserRoles} from "../../../../common/entities/UserDTO";
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class UserEntity implements UserDTO {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column("smallint")
  role: UserRoles;

  @Column("text", {nullable: true})
  permissions: string[];

}
