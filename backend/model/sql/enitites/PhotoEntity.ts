import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {CameraMetadata, PhotoDTO, PhotoMetadata} from '../../../../common/entities/PhotoDTO';
import {DirectoryEntity} from './DirectoryEntity';
import {OrientationTypes} from 'ts-exif-parser';
import {GPSMetadata, MediaDimension, PositionMetaData} from '../../../../common/entities/MediaDTO';

@Entity()
export class CameraMetadataEntity implements CameraMetadata {

  @Column('text', {nullable: true})
  ISO: number;

  @Column('text', {nullable: true})
  model: string;

  @Column('text', {nullable: true})
  maker: string;

  @Column('int', {nullable: true})
  fStop: number;

  @Column('int', {nullable: true})
  exposure: number;

  @Column('int', {nullable: true})
  focalLength: number;

  @Column('text', {nullable: true})
  lens: string;
}


@Entity()
export class GPSMetadataEntity implements GPSMetadata {

  @Column('int', {nullable: true})
  latitude: number;
  @Column('int', {nullable: true})
  longitude: number;
  @Column('int', {nullable: true})
  altitude: number;
}

@Entity()
export class ImageSizeEntity implements MediaDimension {

  @Column('int')
  width: number;

  @Column('int')
  height: number;
}


@Entity()
export class PositionMetaDataEntity implements PositionMetaData {

  @Column(type => GPSMetadataEntity)
  GPSData: GPSMetadataEntity;

  @Column('text', {nullable: true})
  country: string;

  @Column('text', {nullable: true})
  state: string;

  @Column('text', {nullable: true})
  city: string;
}


@Entity()
export class PhotoMetadataEntity implements PhotoMetadata {

  @Column('simple-array')
  keywords: Array<string>;

  @Column(type => CameraMetadataEntity)
  cameraData: CameraMetadataEntity;

  @Column(type => PositionMetaDataEntity)
  positionData: PositionMetaDataEntity;

  @Column('tinyint', {default: OrientationTypes.TOP_LEFT})
  orientation: OrientationTypes;

  @Column(type => ImageSizeEntity)
  size: ImageSizeEntity;

  @Column('bigint')
  creationDate: number;

  @Column('int')
  fileSize: number;
}


@Entity()
export class PhotoEntity implements PhotoDTO {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  name: string;

  @ManyToOne(type => DirectoryEntity, directory => directory.media, {onDelete: 'CASCADE'})
  directory: DirectoryEntity;

  @Column(type => PhotoMetadataEntity)
  metadata: PhotoMetadataEntity;

  readyThumbnails: Array<number> = [];

  readyIcon = false;

}
