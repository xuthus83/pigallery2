import {Table, EmbeddableTable, Column, Embedded, PrimaryGeneratedColumn, ManyToOne} from "typeorm";
import {DirectoryDTO} from "../../../../common/entities/DirectoryDTO";
import {
    PhotoDTO,
    PhotoMetadata,
    CameraMetadata,
    ImageSize,
    PositionMetaData
} from "../../../../common/entities/PhotoDTO";
import {DirectoryEnitity} from "./DirectoryEntity";

@Table()
export class PhotoEntity implements PhotoDTO {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("string")
    name: string;

    @ManyToOne(type => DirectoryEnitity, directory => directory.photos)
    directory: DirectoryDTO;

    @Embedded(type => PhotoMetadataEntity)
    metadata: PhotoMetadataEntity;

    readyThumbnails: Array<number> = [];

}


@EmbeddableTable()
export class PhotoMetadataEntity implements PhotoMetadata {

    @Column("string")
    keywords: Array<string>;

    @Column("string")
    cameraData: CameraMetadata;

    @Column("string")
    positionData: PositionMetaData;

    @Column("string")
    size: ImageSize;

    @Column("datetime")
    creationDate: Date;
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