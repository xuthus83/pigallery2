import {Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {FaceRegionEntry} from './FaceRegionEntry';
import {PersonDTO} from '../../../../../common/entities/PersonDTO';
import {columnCharsetCS} from './EntityUtils';


@Entity()
@Unique(['name'])
export class PersonEntry implements PersonDTO {

  @Index()
  @PrimaryGeneratedColumn({unsigned: true})
  id: number;

  @Column(columnCharsetCS)
  name: string;

  @Column('int', {unsigned: true, default: 0})
  count: number;

  @Column({default: false})
  isFavourite: boolean;

  @OneToMany(type => FaceRegionEntry, faceRegion => faceRegion.person)
  public faces: FaceRegionEntry[];


}
