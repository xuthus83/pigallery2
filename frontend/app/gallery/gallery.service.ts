import {Injectable} from '@angular/core';
import {NetworkService} from '../model/network/network.service';
import {ContentWrapper} from '../../../common/entities/ConentWrapper';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {SearchTypes} from '../../../common/entities/AutoCompleteItem';
import {GalleryCacheService} from './cache.gallery.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {SharingDTO} from '../../../common/entities/SharingDTO';
import {Config} from '../../../common/config/public/Config';
import {ShareService} from './share.service';

@Injectable()
export class GalleryService {

  public content: BehaviorSubject<ContentWrapper>;
  private lastDirectory: DirectoryDTO;
  private searchId: any;

  constructor(private networkService: NetworkService,
              private galleryCacheService: GalleryCacheService,
              private _shareService: ShareService) {
    this.content = new BehaviorSubject<ContentWrapper>(new ContentWrapper());
  }

  lastRequest: { directory: string } = {
    directory: null
  };

  public async getDirectory(directoryName: string): Promise<ContentWrapper> {
    const content = new ContentWrapper();

    content.directory = this.galleryCacheService.getDirectory(directoryName);
    content.searchResult = null;

    this.content.next(content);
    this.lastRequest.directory = directoryName;

    const params = {};
    if (Config.Client.Sharing.enabled == true) {
      if (this._shareService.isSharing()) {
        params['sk'] = this._shareService.getSharingKey();
      }
    }

    if (content.directory && content.directory.lastModified && content.directory.lastScanned &&
      !content.directory.isPartial) {
      params['knownLastModified'] = content.directory.lastModified;
      params['knownLastScanned'] = content.directory.lastScanned;
    }


    const cw = await this.networkService.getJson<ContentWrapper>('/gallery/content/' + directoryName, params);


    if (!cw || cw.notModified == true) {
      return;
    }

    this.galleryCacheService.setDirectory(cw.directory); //save it before adding references

    if (this.lastRequest.directory != directoryName) {
      return;
    }


    DirectoryDTO.addReferences(<DirectoryDTO>cw.directory);


    this.lastDirectory = <DirectoryDTO>cw.directory;
    this.content.next(cw);


    return cw;

  }

  public async search(text: string, type?: SearchTypes): Promise<ContentWrapper> {
    if (this.searchId != null) {
      clearTimeout(this.searchId);
    }
    if (text === null || text === '' || text.trim() == '.') {
      return null;
    }

    this.content.next(new ContentWrapper());
    const cw = new ContentWrapper();
    cw.searchResult = this.galleryCacheService.getSearch(text, type);
    if (cw.searchResult == null) {
      const params = {};
      if (typeof type != 'undefined') {
        params['type'] = type;
      }
      cw.searchResult = (await this.networkService.getJson<ContentWrapper>('/search/' + text, params)).searchResult;
      this.galleryCacheService.setSearch(text, type, cw.searchResult);
    }
    this.content.next(cw);
    return cw;
  }

  public async instantSearch(text: string): Promise<ContentWrapper> {
    if (text === null || text === '' || text.trim() == '.') {
      const content = new ContentWrapper(this.lastDirectory);
      this.content.next(content);
      if (this.searchId != null) {
        clearTimeout(this.searchId);
      }
      if (!this.lastDirectory) {
        this.getDirectory('/');
      }
      return null;
    }

    if (this.searchId != null) {
      clearTimeout(this.searchId);
    }


    const cw = new ContentWrapper();
    cw.directory = null;
    cw.searchResult = this.galleryCacheService.getSearch(text);
    if (cw.searchResult == null) {
      //If result is not search cache, try to load load more
      this.searchId = setTimeout(() => {
        this.search(text);
        this.searchId = null;
      }, Config.Client.Search.InstantSearchTimeout);

      cw.searchResult = this.galleryCacheService.getInstantSearch(text);

      if (cw.searchResult == null) {
        cw.searchResult = (await this.networkService.getJson<ContentWrapper>('/instant-search/' + text)).searchResult;
        this.galleryCacheService.setInstantSearch(text, cw.searchResult);
      }
    }
    this.content.next(cw);

    //if instant search do not have a result, do not do a search
    if (cw.searchResult.photos.length == 0 && cw.searchResult.directories.length == 0) {
      if (this.searchId != null) {
        clearTimeout(this.searchId);
      }
    }
    return cw;

  }

  public async getSharing(sharingKey: string): Promise<SharingDTO> {
    return this.networkService.getJson<SharingDTO>('/share/' + sharingKey);
  }

}
