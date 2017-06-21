import {Injectable} from "@angular/core";
import {NetworkService} from "../model/network/network.service";
import {Message} from "../../../common/entities/Message";
import {ContentWrapper} from "../../../common/entities/ConentWrapper";
import {PhotoDTO} from "../../../common/entities/PhotoDTO";
import {DirectoryDTO} from "../../../common/entities/DirectoryDTO";
import {SearchTypes} from "../../../common/entities/AutoCompleteItem";
import {GalleryCacheService} from "./cache.gallery.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class GalleryService {

  public content: BehaviorSubject<ContentWrapper>;
  private lastDirectory: DirectoryDTO;
  private searchId: any;

  constructor(private networkService: NetworkService, private galleryCacheService: GalleryCacheService) {
    this.content = new BehaviorSubject<ContentWrapper>(new ContentWrapper());
  }

  lastRequest: { directory: string } = {
    directory: null
  };

  public async getDirectory(directoryName: string): Promise<Message<ContentWrapper>> {
    const content = new ContentWrapper();

    content.directory = this.galleryCacheService.getDirectory(directoryName);
    content.searchResult = null;

    this.content.next(content);
    this.lastRequest.directory = directoryName;

    let message: Message<ContentWrapper> = await this.networkService.getJson<Message<ContentWrapper>>("/gallery/content/" + directoryName);

    if (!message.error && message.result) {

      this.galleryCacheService.setDirectory(message.result.directory); //save it before adding references

      if (this.lastRequest.directory != directoryName) {
        return;
      }

      //Add references
      let addDir = (dir: DirectoryDTO) => {
        dir.photos.forEach((photo: PhotoDTO) => {
          photo.directory = dir;
        });

        dir.directories.forEach((directory: DirectoryDTO) => {
          addDir(directory);
          directory.parent = dir;
        });


      };
      addDir(message.result.directory);


      this.lastDirectory = message.result.directory;
      this.content.next(message.result);
    }

    return message;

  }

  //TODO: cache
  public search(text: string, type?: SearchTypes): Promise<Message<ContentWrapper>> {
    clearTimeout(this.searchId);
    if (text === null || text === '') {
      return Promise.resolve(new Message(null, null));
    }

    let queryString = "/search/" + text;
    if (type) {
      queryString += "?type=" + type;
    }

    return this.networkService.getJson(queryString).then(
      (message: Message<ContentWrapper>) => {
        if (!message.error && message.result) {
          this.content.next(message.result);
        }
        return message;
      });
  }

  //TODO: cache (together with normal search)
  public instantSearch(text: string): Promise<Message<ContentWrapper>> {
    if (text === null || text === '') {
      const content = new ContentWrapper();
      content.directory = this.lastDirectory;
      content.searchResult = null;
      this.content.next(content);
      clearTimeout(this.searchId);
      return Promise.resolve(new Message(null, null));
    }

    if (this.searchId != null) {
      clearTimeout(this.searchId);

    }
    this.searchId = setTimeout(() => {
      this.search(text);
      this.searchId = null;
    }, 3000); //TODO: set timeout to config

    return this.networkService.getJson("/instant-search/" + text).then(
      (message: Message<ContentWrapper>) => {
        if (!message.error && message.result) {
          this.content.next(message.result);
        }
        return message;
      });

  }

}
