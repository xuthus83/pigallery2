import {Injectable} from '@angular/core';
import {ShareService} from '../gallery/share.service';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {QueryParams} from '../../../common/QueryParams';
import {Utils} from '../../../common/Utils';
import {GalleryService} from '../gallery/gallery.service';

@Injectable()
export class QueryService {


  constructor(private shareService: ShareService,
              private galleryService: GalleryService) {
  }

  getMediaStringId(media: MediaDTO): string {
    if (this.galleryService.isSearchResult()) {
      return Utils.concatUrls(media.directory.path, media.directory.name, media.name);
    } else {
      return media.name;
    }
  }

  getParams(media?: MediaDTO): { [key: string]: string } {
    const query: { [key: string]: string } = {};
    if (media) {
      query[QueryParams.gallery.photo] = this.getMediaStringId(media);
    }
    if (this.shareService.isSharing()) {
      query[QueryParams.gallery.sharingKey_short] = this.shareService.getSharingKey();
    }
    return query;
  }

}
