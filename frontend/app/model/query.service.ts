import {Injectable} from '@angular/core';
import {ShareService} from '../gallery/share.service';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {MediaDTO} from '../../../common/entities/MediaDTO';

@Injectable()
export class QueryService {

  public static readonly PHOTO_PARAM = 'p';
  public static readonly SHARING_KEY = 'sk';

  constructor(private shareService: ShareService) {
  }

  getParams(media?: MediaDTO): { [key: string]: string } {
    const query: { [key: string]: string } = {};
    if (media) {
      query[QueryService.PHOTO_PARAM] = media.name;
    }
    if (this.shareService.isSharing()) {
      query[QueryService.SHARING_KEY] = this.shareService.getSharingKey();
    }
    return query;
  }

}
