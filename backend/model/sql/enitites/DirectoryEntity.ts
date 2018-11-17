import {Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {MediaEntity} from './MediaEntity';

@Entity()
export class DirectoryEntity implements DirectoryDTO {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

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

  @ManyToOne(type => DirectoryEntity, directory => directory.directories, {onDelete: 'CASCADE'})
  public parent: DirectoryEntity;

  @OneToMany(type => DirectoryEntity, dir => dir.parent)
  public directories: DirectoryEntity[];

  @OneToMany(type => MediaEntity, media => media.directory)
  public media: MediaEntity[];

}
