import {Injectable} from '@angular/core';
import {NetworkService} from '../../model/network/network.service';
import {ContentWrapper} from '../../../../common/entities/ConentWrapper';
import {DirectoryDTO} from '../../../../common/entities/DirectoryDTO';
import {GalleryCacheService} from './cache.gallery.service';
import {BehaviorSubject} from 'rxjs';
import {Config} from '../../../../common/config/public/Config';
import {ShareService} from './share.service';
import {NavigationService} from '../../model/navigation.service';
import {SortingMethods} from '../../../../common/entities/SortingMethods';
import {QueryParams} from '../../../../common/QueryParams';
import {PG2ConfMap} from '../../../../common/PG2ConfMap';
import {SearchQueryDTO} from '../../../../common/entities/SearchQueryDTO';


@Injectable()
export class GalleryService {

  public content: BehaviorSubject<ContentWrapper>;
  public sorting: BehaviorSubject<SortingMethods>;
  lastRequest: { directory: string } = {
    directory: null
  };
  private lastDirectory: DirectoryDTO;
  private searchId: any;
  private ongoingSearch: SearchQueryDTO = null;

  constructor(private networkService: NetworkService,
              private galleryCacheService: GalleryCacheService,
              private _shareService: ShareService,
              private navigationService: NavigationService) {
    this.content = new BehaviorSubject<ContentWrapper>(new ContentWrapper());
    this.sorting = new BehaviorSubject<SortingMethods>(Config.Client.Other.defaultPhotoSortingMethod);
  }

  getDefaultSorting(directory: DirectoryDTO): SortingMethods {
    if (directory && directory.metaFile) {
      for (const file in PG2ConfMap.sorting) {
        if (directory.metaFile.some(f => f.name === file)) {
          return (<any>PG2ConfMap.sorting)[file];
        }
      }
    }
    return Config.Client.Other.defaultPhotoSortingMethod;
  }

  setSorting(sorting: SortingMethods): void {
    this.sorting.next(sorting);
    if (this.content.value.directory) {
      if (sorting !== this.getDefaultSorting(this.content.value.directory)) {
        this.galleryCacheService.setSorting(this.content.value.directory, sorting);
      } else {
        this.galleryCacheService.removeSorting(this.content.value.directory);
      }
    }
  }


  setContent(content: ContentWrapper): void {
    this.content.next(content);
    if (content.directory) {
      const sort = this.galleryCacheService.getSorting(content.directory);
      if (sort !== null) {
        this.sorting.next(sort);
      } else {
        this.sorting.next(this.getDefaultSorting(content.directory));
      }
    }
  }


  public async loadDirectory(directoryName: string): Promise<void> {
    const content = new ContentWrapper();

    content.directory = this.galleryCacheService.getDirectory(directoryName);
    content.searchResult = null;


    this.setContent(content);
    this.lastRequest.directory = directoryName;

    const params: { [key: string]: any } = {};
    if (Config.Client.Sharing.enabled === true) {
      if (this._shareService.isSharing()) {
        params[QueryParams.gallery.sharingKey_query] = this._shareService.getSharingKey();
      }
    }

    if (content.directory && content.directory.lastModified && content.directory.lastScanned &&
      !content.directory.isPartial) {
      params[QueryParams.gallery.knownLastModified] = content.directory.lastModified;
      params[QueryParams.gallery.knownLastScanned] = content.directory.lastScanned;
    }

    try {
      const cw = await this.networkService.getJson<ContentWrapper>('/gallery/content/' + directoryName, params);


      if (!cw || cw.notModified === true) {
        return;
      }

      this.galleryCacheService.setDirectory(cw.directory); // save it before adding references

      if (this.lastRequest.directory !== directoryName) {
        return;
      }

      DirectoryDTO.addReferences(<DirectoryDTO>cw.directory);

      this.lastDirectory = <DirectoryDTO>cw.directory;
      this.setContent(cw);
    } catch (e) {
      console.error(e);
      this.navigationService.toGallery().catch(console.error);
    }
  }

  public async search(query: SearchQueryDTO): Promise<void> {
    if (this.searchId != null) {
      clearTimeout(this.searchId);
    }

    this.ongoingSearch = query;


    this.setContent(new ContentWrapper());
    const cw = new ContentWrapper();
    cw.searchResult = this.galleryCacheService.getSearch(query);
    if (cw.searchResult == null) {
      cw.searchResult = (await this.networkService.getJson<ContentWrapper>('/search/' + query)).searchResult;
      this.galleryCacheService.setSearch(query, cw.searchResult);
    }

    if (this.ongoingSearch !== query) {
      return;
    }

    this.setContent(cw);
  }


  isSearchResult(): boolean {
    return !!this.content.value.searchResult;
  }


}
