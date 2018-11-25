import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {DirectoryEntity} from './DirectoryEntity';
import {FileDTO} from '../../../../common/entities/FileDTO';


@Entity()
export class FileEntity implements FileDTO {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @ManyToOne(type => DirectoryEntity, directory => directory.metaFile, {onDelete: 'CASCADE'})
  directory: DirectoryEntity;
}
