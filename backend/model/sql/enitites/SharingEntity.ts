import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {SharingDTO} from "../../../../common/entities/SharingDTO";
import {UserEntity} from "./UserEntity";
import {UserDTO} from "../../../../common/entities/UserDTO";

@Entity()
export class SharingEntity implements SharingDTO {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sharingKey: string;

  @Column()
  path: string;

  @Column({type: "text", nullable: true})
  password: string;

  @Column()
  expires: number;

  @Column()
  timeStamp: number;

  @Column()
  includeSubfolders: boolean;

  @ManyToOne(type => UserEntity)
  creator: UserDTO;
}
