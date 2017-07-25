import {Injectable} from "@angular/core";
import {NetworkService} from "../model/network/network.service";
import {ContentWrapper} from "../../../common/entities/ConentWrapper";
import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
import {SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {GalleryCacheService} from "./cache.gallery.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {SharingDTO} from "../../../common/entities/SharingDTO";
import {Config} from "../../../common/config/public/Config";
import {ShareService} from "./share.service";

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


    const cw = await this.networkService.getJson<ContentWrapper>("/gallery/content/" + directoryName, params);


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

  //TODO: cache
  public async search(text: string, type?: SearchTypes): Promise<ContentWrapper> {
    clearTimeout(this.searchId);
    if (text === null || text === '' || text.trim() == ".") {
      return null
    }

    const cw: ContentWrapper = await this.networkService.getJson<ContentWrapper>("/search/" + text, {type: type});
    console.log("photos", cw.searchResult.photos.length);
    console.log("direcotries", cw.searchResult.directories.length);
    this.content.next(cw);
    return cw;
  }

  //TODO: cache (together with normal search)
  public async instantSearch(text: string): Promise<ContentWrapper> {
    if (text === null || text === '' || text.trim() == ".") {
      const content = new ContentWrapper();
      content.directory = this.lastDirectory;
      content.searchResult = null;
      this.content.next(content);
      clearTimeout(this.searchId);
      return null
    }

    if (this.searchId != null) {
      clearTimeout(this.searchId);

    }
    this.searchId = setTimeout(() => {
      this.search(text);
      this.searchId = null;
    }, Config.Client.Search.InstantSearchTimeout); //TODO: set timeout to config

    const cw = await this.networkService.getJson<ContentWrapper>("/instant-search/" + text);
    this.content.next(cw);
    return cw;

  }

  public async getSharing(sharingKey: string): Promise<SharingDTO> {
    return this.networkService.getJson<SharingDTO>("/share/" + sharingKey);
  }

}
