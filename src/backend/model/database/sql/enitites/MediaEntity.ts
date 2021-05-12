import {Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, TableInheritance, Unique} from 'typeorm';
import {DirectoryEntity} from './DirectoryEntity';
import {MediaDimension, MediaDTO, MediaMetadata} from '../../../../../common/entities/MediaDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {CameraMetadataEntity, PositionMetaDataEntity} from './PhotoEntity';
import {FaceRegionEntry} from './FaceRegionEntry';
import {columnCharsetCS} from './EntityUtils';

export class MediaDimensionEntity implements MediaDimension {

  @Column('int')
  width: number;

  @Column('int')
  height: number;
}


export class MediaMetadataEntity implements MediaMetadata {

  @Index()
  @Column('text')
  caption: string;

  @Column(type => MediaDimensionEntity)
  size: MediaDimensionEntity;

  /**
   * Date in local timezone
   * Reason: If you look back your holiday photos from a different timezone,
   * you do not want to see 2AM next to a photo that was taken during lunch
   */
  @Column('bigint', {
    unsigned: true, transformer: {
      from: v => parseInt(v, 10),
      to: v => v
    }
  })
  creationDate: number;

  @Column('int', {unsigned: true})
  fileSize: number;

  @Index()
  @Column({
    type: 'simple-array',
    charset: columnCharsetCS.charset,
    collation: columnCharsetCS.collation
  })
  keywords: string[];

  @Column(type => CameraMetadataEntity)
  cameraData: CameraMetadataEntity;

  @Column(type => PositionMetaDataEntity)
  positionData: PositionMetaDataEntity;

  @Index()
  @Column('tinyint', {unsigned: true})
  rating: 0 | 1 | 2 | 3 | 4 | 5;

  @Column('tinyint', {unsigned: true, default: OrientationTypes.TOP_LEFT})
  orientation: OrientationTypes;

  @OneToMany(type => FaceRegionEntry, faceRegion => faceRegion.media)
  faces: FaceRegionEntry[];

  /**
   * Caches the list of persons. Only used for searching
   */
  @Index()
  @Column({
    type: 'simple-array', select: false, nullable: true,
    charset: columnCharsetCS.charset,
    collation: columnCharsetCS.collation
  })
  persons: string[];

  @Column('int', {unsigned: true})
  bitRate: number;

  @Column('int', {unsigned: true})
  duration: number;
}


// TODO: fix inheritance once its working in typeorm
@Entity()
@Unique(['name', 'directory'])
@TableInheritance({column: {type: 'varchar', name: 'type', length: 32}})
export abstract class MediaEntity implements MediaDTO {

  @Index()
  @PrimaryGeneratedColumn({unsigned: true})
  id: number;

  @Index()
  @Column(columnCharsetCS)
  name: string;

  @Index()
  @ManyToOne(type => DirectoryEntity, directory => directory.media, {onDelete: 'CASCADE', nullable: false})
  directory: DirectoryEntity;

  @Column(type => MediaMetadataEntity)
  metadata: MediaMetadataEntity;

  readyThumbnails: number[] = [];

  readyIcon = false;

}
