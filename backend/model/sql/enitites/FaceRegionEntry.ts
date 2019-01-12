import {FaceRegionBox} from '../../../../common/entities/PhotoDTO';
import {Column, ManyToOne, Entity, PrimaryGeneratedColumn} from 'typeorm';
import {PersonEntry} from './PersonEntry';
import {MediaEntity, MediaMetadataEntity} from './MediaEntity';

export class FaceRegionBoxEntry implements FaceRegionBox {
  @Column('int')
  height: number;
  @Column('int')
  width: number;
  @Column('int')
  x: number;
  @Column('int')
  y: number;
}

/**
 * This is a switching table between media and persons
 */
@Entity()
export class FaceRegionEntry {

  @PrimaryGeneratedColumn()
  id: number;

  @Column(type => FaceRegionBoxEntry)
  box: FaceRegionBoxEntry;

  // @PrimaryColumn('int')
  @ManyToOne(type => MediaEntity, media => media.metadata.faces, {onDelete: 'CASCADE', nullable: false})
  media: MediaEntity;

  // @PrimaryColumn('int')
  @ManyToOne(type => PersonEntry, person => person.faces, {onDelete: 'CASCADE', nullable: false})
  person: PersonEntry;

  name: string;
}
