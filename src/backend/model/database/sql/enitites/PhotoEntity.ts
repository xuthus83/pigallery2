import {ChildEntity, Column, Index} from 'typeorm';
import {CameraMetadata, GPSMetadata, PhotoDTO, PhotoMetadata, PositionMetaData} from '../../../../../common/entities/PhotoDTO';
import {MediaEntity, MediaMetadataEntity} from './MediaEntity';
import {columnCharsetCS} from './EntityUtils';

export class CameraMetadataEntity implements CameraMetadata {

  @Column('int', {nullable: true, unsigned: true})
  ISO: number;


  @Column({
    type: 'varchar', nullable: true,
    length: 64,
    charset: columnCharsetCS.charset,
    collation: columnCharsetCS.collation
  })
  model: string;


  @Column({
    type: 'varchar', nullable: true,
    length: 64,
    charset: columnCharsetCS.charset,
    collation: columnCharsetCS.collation
  })
  make: string;

  @Column('float', {nullable: true})
  fStop: number;

  @Column('float', {nullable: true})
  exposure: number;

  @Column('float', {nullable: true})
  focalLength: number;

  @Column('text', {nullable: true})
  lens: string;
}


export class GPSMetadataEntity implements GPSMetadata {

  @Column('float', {nullable: true})
  latitude: number;
  @Column('float', {nullable: true})
  longitude: number;
  @Column('int', {nullable: true})
  altitude: number;
}


export class PositionMetaDataEntity implements PositionMetaData {

  @Column(type => GPSMetadataEntity)
  GPSData: GPSMetadataEntity;

  @Index()
  @Column({
    type: 'varchar', nullable: true,
    length: 64,
    charset: columnCharsetCS.charset,
    collation: columnCharsetCS.collation
  })
  country: string;

  @Index()
  @Column({
    type: 'varchar', nullable: true,
    length: 64,
    charset: columnCharsetCS.charset,
    collation: columnCharsetCS.collation
  })
  state: string;

  @Index()
  @Column({
    type: 'varchar', nullable: true,
    length: 64,
    charset: columnCharsetCS.charset,
    collation: columnCharsetCS.collation
  })
  city: string;
}


export class PhotoMetadataEntity extends MediaMetadataEntity implements PhotoMetadata {
  /*
    @Column('simple-array')
    keywords: string[];

    @Column(type => CameraMetadataEntity)
    cameraData: CameraMetadataEntity;

    @Column(type => PositionMetaDataEntity)
    positionData: PositionMetaDataEntity;

    @Column('tinyint', {default: OrientationTypes.TOP_LEFT})
    orientation: OrientationTypes;
  */
}


@ChildEntity()
export class PhotoEntity extends MediaEntity implements PhotoDTO {
  @Column(type => PhotoMetadataEntity)
  metadata: PhotoMetadataEntity;
}
