import {Media} from '../Media';
import {MediaDTO} from '../../../../common/entities/MediaDTO';
import {OrientationTypes} from 'ts-exif-parser';
import {PhotoDTO} from '../../../../common/entities/PhotoDTO';

export class GridMedia extends Media {


  constructor(media: MediaDTO, renderWidth: number, renderHeight: number, public rowId: number) {
    super(media, renderWidth, renderHeight);
  }

  public get Orientation(): OrientationTypes {
    return (<PhotoDTO>this.media).metadata.orientation || OrientationTypes.TOP_LEFT;
  }

  isPhoto(): boolean {
    return typeof (<PhotoDTO>this.media).metadata.cameraData !== 'undefined';
  }

  isVideo(): boolean {
    return typeof (<PhotoDTO>this.media).metadata.cameraData === 'undefined';
  }


}
