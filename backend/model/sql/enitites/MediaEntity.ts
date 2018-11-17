import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, TableInheritance} from 'typeorm';
import {DirectoryEntity} from './DirectoryEntity';
import {MediaDimension, MediaDTO, MediaMetadata} from '../../../../common/entities/MediaDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {CameraMetadataEntity, PositionMetaDataEntity} from './PhotoEntity';


export class MediaDimensionEntity implements MediaDimension {

  @Column('int')
  width: number;

  @Column('int')
  height: number;
}


export class MediaMetadataEntity implements MediaMetadata {

  @Column(type => MediaDimensionEntity)
  size: MediaDimensionEntity;

  @Column('bigint')
  creationDate: number;

  @Column('int')
  fileSize: number;


  @Column('simple-array')
  keywords: string[];

  @Column(type => CameraMetadataEntity)
  cameraData: CameraMetadataEntity;

  @Column(type => PositionMetaDataEntity)
  positionData: PositionMetaDataEntity;

  @Column('tinyint', {default: OrientationTypes.TOP_LEFT})
  orientation: OrientationTypes;

  @Column('int')
  bitRate: number;

  @Column('bigint')
  duration: number;
}

// TODO: fix inheritance once its working in typeorm
@Entity()
@TableInheritance({column: {type: 'varchar', name: 'type'}})
export abstract class MediaEntity implements MediaDTO {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @ManyToOne(type => DirectoryEntity, directory => directory.media, {onDelete: 'CASCADE'})
  directory: DirectoryEntity;

  @Column(type => MediaMetadataEntity)
  metadata: MediaMetadataEntity;

  readyThumbnails: number[] = [];

  readyIcon = false;

}
