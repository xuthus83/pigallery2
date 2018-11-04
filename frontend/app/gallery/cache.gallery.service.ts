import {Injectable} from '@angular/core';
import {PhotoDTO} from '../../../common/entities/PhotoDTO';
import {DirectoryDTO} from '../../../common/entities/DirectoryDTO';
import {Utils} from '../../../common/Utils';
import {Config} from '../../../common/config/public/Config';
import {AutoCompleteItem, SearchTypes} from '../../../common/entities/AutoCompleteItem';
import {SearchResultDTO} from '../../../common/entities/SearchResultDTO';
import {MediaDTO} from '../../../common/entities/MediaDTO';

interface CacheItem<T> {
  timestamp: number;
  item: T;
}

@Injectable()
export class GalleryCacheService {

  private static CONTENT_PREFIX = 'content:';
  private static AUTO_COMPLETE_PREFIX = 'autocomplete:';
  private static INSTANT_SEARCH_PREFIX = 'instant_search:';
  private static SEARCH_PREFIX = 'search:';
  private static SEARCH_TYPE_PREFIX = ':type:';


  public getAutoComplete(text: string): Array<AutoCompleteItem> {
    const key = GalleryCacheService.AUTO_COMPLETE_PREFIX + text;
    const tmp = localStorage.getItem(key);
    if (tmp != null) {
      const value: CacheItem<Array<AutoCompleteItem>> = JSON.parse(tmp);
      if (value.timestamp < Date.now() - Config.Client.Search.autocompleteCacheTimeout) {
        localStorage.removeItem(key);
        return null;
      }
      return value.item;
    }
    return null;
  }

  public setAutoComplete(text: string, items: Array<AutoCompleteItem>): void {
    const tmp: CacheItem<Array<AutoCompleteItem>> = {
      timestamp: Date.now(),
      item: items
    };
    localStorage.setItem(GalleryCacheService.AUTO_COMPLETE_PREFIX + text, JSON.stringify(tmp));
  }

  public getInstantSearch(text: string): SearchResultDTO {
    const key = GalleryCacheService.INSTANT_SEARCH_PREFIX + text;
    const tmp = localStorage.getItem(key);
    if (tmp != null) {
      const value: CacheItem<SearchResultDTO> = JSON.parse(tmp);
      if (value.timestamp < Date.now() - Config.Client.Search.instantSearchCacheTimeout) {
        localStorage.removeItem(key);
        return null;
      }
      return value.item;
    }
    return null;
  }

  public setInstantSearch(text: string, searchResult: SearchResultDTO): void {
    const tmp: CacheItem<SearchResultDTO> = {
      timestamp: Date.now(),
      item: searchResult
    };
    localStorage.setItem(GalleryCacheService.INSTANT_SEARCH_PREFIX + text, JSON.stringify(tmp));
  }


  public getSearch(text: string, type?: SearchTypes): SearchResultDTO {
    let key = GalleryCacheService.SEARCH_PREFIX + text;
    if (typeof type !== 'undefined') {
      key += GalleryCacheService.SEARCH_TYPE_PREFIX + type;
    }
    const tmp = localStorage.getItem(key);
    if (tmp != null) {
      const value: CacheItem<SearchResultDTO> = JSON.parse(tmp);
      if (value.timestamp < Date.now() - Config.Client.Search.searchCacheTimeout) {
        localStorage.removeItem(key);
        return null;
      }
      return value.item;
    }
    return null;
  }

  public setSearch(text: string, type: SearchTypes, searchResult: SearchResultDTO): void {
    const tmp: CacheItem<SearchResultDTO> = {
      timestamp: Date.now(),
      item: searchResult
    };
    let key = GalleryCacheService.SEARCH_PREFIX + text;
    if (typeof type !== 'undefined') {
      key += GalleryCacheService.SEARCH_TYPE_PREFIX + type;
    }
    localStorage.setItem(key, JSON.stringify(tmp));
  }


  public getDirectory(directoryName: string): DirectoryDTO {
    if (Config.Client.Other.enableCache === false) {
      return null;
    }
    const value = localStorage.getItem(GalleryCacheService.CONTENT_PREFIX + Utils.concatUrls(directoryName));
    if (value != null) {
      const directory: DirectoryDTO = JSON.parse(value);

      DirectoryDTO.addReferences(directory);
      return directory;
    }
    return null;
  }

  public setDirectory(directory: DirectoryDTO): void {
    if (Config.Client.Other.enableCache === false) {
      return;
    }

    const key = GalleryCacheService.CONTENT_PREFIX + Utils.concatUrls(directory.path, directory.name);
    if (directory.isPartial === true && localStorage.getItem(key)) {
      return;
    }

    localStorage.setItem(key, JSON.stringify(directory));

    directory.directories.forEach((dir: DirectoryDTO) => {
      const sub_key = GalleryCacheService.CONTENT_PREFIX + Utils.concatUrls(dir.path, dir.name);
      if (localStorage.getItem(sub_key) == null) { // don't override existing
        localStorage.setItem(sub_key, JSON.stringify(dir));
      }
    });

  }

  /**
   * Update media state at cache too (Eg.: thumbnail rendered)
   * @param media
   */
  public mediaUpdated(media: MediaDTO): void {

    if (Config.Client.Other.enableCache === false) {
      return;
    }

    const directoryName = Utils.concatUrls(media.directory.path, media.directory.name);
    const value = localStorage.getItem(directoryName);
    if (value != null) {
      const directory: DirectoryDTO = JSON.parse(value);
      directory.media.forEach((p) => {
        if (p.name === media.name) {
          // update data
          p.metadata = media.metadata;
          p.readyThumbnails = media.readyThumbnails;

          // save changes
          localStorage.setItem(directoryName, JSON.stringify(directory));
          return;
        }
      });
    }

  }

}
