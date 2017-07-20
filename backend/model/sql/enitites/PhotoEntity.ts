import {Column, EmbeddableEntity, Embedded, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {DirectoryDTO} from "../../../../common/entities/DirectoryDTO";
import {
  CameraMetadata,
  ImageSize,
  PhotoDTO,
  PhotoMetadata,
  PositionMetaData
} from "../../../../common/entities/PhotoDTO";
import {DirectoryEntity} from "./DirectoryEntity";

@Entity()
export class PhotoEntity implements PhotoDTO {

  @PrimaryGeneratedColumn()
  id: number;

  @Column("string")
  name: string;

  @ManyToOne(type => DirectoryEntity, directory => directory.photos, {onDelete: "CASCADE"})
  directory: DirectoryDTO;

  @Embedded(type => PhotoMetadataEntity)
  metadata: PhotoMetadataEntity;

  readyThumbnails: Array<number> = [];

  readyIcon: boolean = false;

}


@EmbeddableEntity()
export class PhotoMetadataEntity implements PhotoMetadata {

  @Column("string")
  keywords: Array<string>;

  @Column("string")
  cameraData: CameraMetadata;

  @Column("string")
  positionData: PositionMetaData;

  @Column("string")
  size: ImageSize;

  @Column("number")
  creationDate: number;

  @Column("number")
  fileSize: number;

  //TODO: fixit after typeorm update
  public static open(m: PhotoMetadataEntity) {
    m.keywords = <any>JSON.parse(<any>m.keywords);
    m.cameraData = <any>JSON.parse(<any>m.cameraData);
    m.positionData = <any>JSON.parse(<any>m.positionData);
    m.size = <any>JSON.parse(<any>m.size);
  }

  //TODO: fixit after typeorm update
  public static close(m: PhotoMetadataEntity) {
    m.keywords = <any>JSON.stringify(<any>m.keywords);
    m.cameraData = <any>JSON.stringify(<any>m.cameraData);
    m.positionData = <any>JSON.stringify(<any>m.positionData);
    m.size = <any>JSON.stringify(<any>m.size);
  }
}

/*
 @EmbeddableTable()
 export class CameraMetadataEntity implements CameraMetadata {

 @Column("string")
 ISO: number;

 @Column("string")
 model: string;

 @Column("string")
 maker: string;

 @Column("int")
 fStop: number;

 @Column("int")
 exposure: number;

 @Column("int")
 focalLength: number;

 @Column("string")
 lens: string;
 }
 /*

 @EmbeddableTable()
 export class PositionMetaDataEntity implements PositionMetaData {

 @Embedded(type => GPSMetadataEntity)
 GPSData: GPSMetadataEntity;

 @Column("string")
 country: string;

 @Column("string")
 state: string;

 @Column("string")
 city: string;
 }


 @EmbeddableTable()
 export class GPSMetadataEntity implements GPSMetadata {

 @Column("string")
 latitude: string;
 @Column("string")
 longitude: string;
 @Column("string")
 altitude: string;
 }

 @EmbeddableTable()
 export class ImageSizeEntity implements ImageSize {

 @Column("int")
 width: number;

 @Column("int")
 height: number;
 }*/
