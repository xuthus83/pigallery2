import {Injectable} from '@angular/core';
import {ShareService} from '../gallery/share.service';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {QueryParams} from '../../../common/QueryParams';

@Injectable()
export class QueryService {


  constructor(private shareService: ShareService) {
  }

  getParams(media?: MediaDTO): { [key: string]: string } {
    const query: { [key: string]: string } = {};
    if (media) {
      query[QueryParams.gallery.photo] = media.name;
    }
    if (this.shareService.isSharing()) {
      query[QueryParams.gallery.sharingKey_short] = this.shareService.getSharingKey();
    }
    return query;
  }

}
