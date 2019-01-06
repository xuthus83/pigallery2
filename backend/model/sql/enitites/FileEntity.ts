import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index} from 'typeorm';
import {DirectoryEntity} from './DirectoryEntity';
import {FileDTO} from '../../../../common/entities/FileDTO';


@Entity()
export class FileEntity implements FileDTO {

  @Index()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @Index()
  @ManyToOne(type => DirectoryEntity, directory => directory.metaFile, {onDelete: 'CASCADE'})
  directory: DirectoryEntity;
}
