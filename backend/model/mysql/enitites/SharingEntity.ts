import {Column, EmbeddableEntity, Embedded, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {SharingDTO} from "../../../../common/entities/SharingDTO";
import {UserEntity} from "./UserEntity";
import {UserDTO} from "../../../../common/entities/UserDTO";

@Entity()
export class SharingEntity implements SharingDTO {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("string")
  sharingKey: string;

  @Column("string")
  path: string;

  @Column("string", {nullable: true})
  password: string;

  @Column("number")
  expires: number;

  @Column("number")
  timeStamp: number;

  @Column("boolean")
  includeSubfolders: boolean;

  @ManyToOne(type => UserEntity)
  creator: UserDTO;
}
