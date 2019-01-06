import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, Index} from 'typeorm';
import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {MediaEntity} from './MediaEntity';
import {FileEntity} from './FileEntity';

@Entity()
@Unique(['name', 'path'])
export class DirectoryEntity implements DirectoryDTO {

  @Index()
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  name: string;

  @Index()
  @Column()
  path: string;

  /**
   * last time the directory was modified (from outside, eg.: a new media was added)
   */
  @Column('bigint')
  public lastModified: number;

  /**
   * Last time the directory was fully scanned, not only for a few media to create a preview
   */
  @Column({type: 'bigint', nullable: true})
  public lastScanned: number;

  isPartial?: boolean;

  @Column('smallint')
  mediaCount: number;

  @Index()
  @ManyToOne(type => DirectoryEntity, directory => directory.directories, {onDelete: 'CASCADE'})
  public parent: DirectoryEntity;

  @OneToMany(type => DirectoryEntity, dir => dir.parent)
  public directories: DirectoryEntity[];

  @OneToMany(type => MediaEntity, media => media.directory)
  public media: MediaEntity[];

  @OneToMany(type => FileEntity, file => file.directory)
  public metaFile: FileEntity[];

}
