import {Column, Entity, ChildEntity} from 'typeorm';
import { MediaEntity, MediaMetadataEntity} from './MediaEntity';
import {VideoDTO, VideoMetadata} from '../../../../common/entities/VideoDTO';


export class VideoMetadataEntity extends MediaMetadataEntity implements VideoMetadata {

  @Column('int')
  bitRate: number;

  @Column('bigint')
  duration: number;

}


@ChildEntity()
export class VideoEntity extends MediaEntity implements VideoDTO {
  @Column(type => VideoMetadataEntity)
  metadata: VideoMetadataEntity;
}
