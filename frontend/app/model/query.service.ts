import {Injectable} from '@angular/core';
import {ShareService} from '../gallery/share.service';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';

@Injectable()
export class QueryService {

  public static readonly PHOTO_PARAM = 'p';

  constructor(private shareService: ShareService) {
  }

  getParams(photo?: PhotoDTO): { [key: string]: string } {
    const query = {};
    if (photo) {
      query[QueryService.PHOTO_PARAM] = photo.name;
    }
    if (this.shareService.isSharing()) {
      query['sk'] = this.shareService.getSharingKey();
    }
    return query;
  }

}
