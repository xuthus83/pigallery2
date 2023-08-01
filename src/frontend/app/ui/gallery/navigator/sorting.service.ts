import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {ParentDirectoryDTO} from '../../../../../common/entities/DirectoryDTO';
import {GalleryCacheService} from '../cache.gallery.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Config} from '../../../../../common/config/public/Config';
import {SortingMethods} from '../../../../../common/entities/SortingMethods';
import {PG2ConfMap} from '../../../../../common/PG2ConfMap';
import {ContentService, ContentWrapperWithError, DirectoryContent} from '../content.service';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {map, switchMap} from 'rxjs/operators';
import {SeededRandomService} from '../../../model/seededRandom.service';
import {ContentWrapper} from '../../../../../common/entities/ConentWrapper';

@Injectable()
export class GallerySortingService {
  public sorting: BehaviorSubject<SortingMethods>;
  private collator = new Intl.Collator(undefined, {numeric: true});

  constructor(
    private networkService: NetworkService,
    private galleryCacheService: GalleryCacheService,
    private galleryService: ContentService,
    private rndService: SeededRandomService
  ) {
    this.sorting = new BehaviorSubject<SortingMethods>(
      Config.Gallery.defaultPhotoSortingMethod
    );
    this.galleryService.content.subscribe((c) => {
      if (c.directory) {
        const sort = this.galleryCacheService.getSorting(c.directory);
        if (sort !== null) {
          this.sorting.next(sort);
          return;
        }
      }
      this.sorting.next(this.getDefaultSorting(c));
    });
  }

  getDefaultSorting(cw: ContentWrapper): SortingMethods {
    if (cw.directory && cw.directory.metaFile) {
      for (const file in PG2ConfMap.sorting) {
        if (cw.directory.metaFile.some((f) => f.name === file)) {
          return (PG2ConfMap.sorting as any)[file];
        }
      }
    }
    if (cw.searchResult) {
      return Config.Gallery.defaultSearchSortingMethod;
    }
    return Config.Gallery.defaultPhotoSortingMethod;
  }

  setSorting(sorting: SortingMethods): void {
    this.sorting.next(sorting);
    if (this.galleryService.content.value.directory) {
      if (
        sorting !==
        this.getDefaultSorting(this.galleryService.content.value)
      ) {
        this.galleryCacheService.setSorting(
          this.galleryService.content.value.directory,
          sorting
        );
      } else {
        this.galleryCacheService.removeSorting(
          this.galleryService.content.value.directory
        );
      }
    }
  }

  public applySorting(
    directoryContent: Observable<DirectoryContent>
  ): Observable<DirectoryContent> {
    return directoryContent.pipe(
      switchMap((dirContent) => {
        return this.sorting.pipe(
          map((sorting: SortingMethods) => {
            if (!dirContent) {
              return dirContent;
            }
            const c = {
              media: dirContent.media,
              directories: dirContent.directories,
              metaFile: dirContent.metaFile,
            };
            if (c.directories) {
              switch (sorting) {
                case SortingMethods.ascRating: // directories do not have rating
                case SortingMethods.ascName:
                  c.directories.sort((a, b) =>
                    this.collator.compare(a.name, b.name)
                  );
                  break;
                case SortingMethods.ascDate:
                  if (
                    Config.Gallery.enableDirectorySortingByDate === true
                  ) {
                    c.directories.sort(
                      (a, b) => a.lastModified - b.lastModified
                    );
                    break;
                  }
                  c.directories.sort((a, b) =>
                    this.collator.compare(a.name, b.name)
                  );
                  break;
                case SortingMethods.descRating: // directories do not have rating
                case SortingMethods.descName:
                  c.directories.sort((a, b) =>
                    this.collator.compare(b.name, a.name)
                  );
                  break;
                case SortingMethods.descDate:
                  if (
                    Config.Gallery.enableDirectorySortingByDate === true
                  ) {
                    c.directories.sort(
                      (a, b) => b.lastModified - a.lastModified
                    );
                    break;
                  }
                  c.directories.sort((a, b) =>
                    this.collator.compare(b.name, a.name)
                  );
                  break;
                case SortingMethods.random:
                  this.rndService.setSeed(c.directories.length);
                  c.directories
                    .sort((a, b): number => {
                      if (a.name.toLowerCase() < b.name.toLowerCase()) {
                        return 1;
                      }
                      if (a.name.toLowerCase() > b.name.toLowerCase()) {
                        return -1;
                      }
                      return 0;
                    })
                    .sort((): number => {
                      return this.rndService.get() - 0.5;
                    });
                  break;
              }
            }

            if (c.media) {
              switch (sorting) {
                case SortingMethods.ascName:
                  c.media.sort((a: PhotoDTO, b: PhotoDTO) =>
                    this.collator.compare(a.name, b.name)
                  );
                  break;
                case SortingMethods.descName:
                  c.media.sort((a: PhotoDTO, b: PhotoDTO) =>
                    this.collator.compare(b.name, a.name)
                  );
                  break;
                case SortingMethods.ascDate:
                  c.media.sort((a: PhotoDTO, b: PhotoDTO): number => {
                    return a.metadata.creationDate - b.metadata.creationDate;
                  });
                  break;
                case SortingMethods.descDate:
                  c.media.sort((a: PhotoDTO, b: PhotoDTO): number => {
                    return b.metadata.creationDate - a.metadata.creationDate;
                  });
                  break;
                case SortingMethods.ascRating:
                  c.media.sort(
                    (a: PhotoDTO, b: PhotoDTO) =>
                      (a.metadata.rating || 0) - (b.metadata.rating || 0)
                  );
                  break;
                case SortingMethods.descRating:
                  c.media.sort(
                    (a: PhotoDTO, b: PhotoDTO) =>
                      (b.metadata.rating || 0) - (a.metadata.rating || 0)
                  );
                  break;
                case SortingMethods.ascPersonCount:
                  c.media.sort(
                    (a: PhotoDTO, b: PhotoDTO) =>
                      (a.metadata?.faces?.length || 0) - (b.metadata?.faces?.length || 0)
                  );
                  break;
                case SortingMethods.descPersonCount:
                  c.media.sort(
                    (a: PhotoDTO, b: PhotoDTO) =>
                      (b.metadata?.faces?.length || 0) - (a.metadata?.faces?.length || 0)
                  );
                  break;
                case SortingMethods.random:
                  this.rndService.setSeed(c.media.length);
                  c.media
                    .sort((a: PhotoDTO, b: PhotoDTO): number => {
                      if (a.name.toLowerCase() < b.name.toLowerCase()) {
                        return -1;
                      }
                      if (a.name.toLowerCase() > b.name.toLowerCase()) {
                        return 1;
                      }
                      return 0;
                    })
                    .sort((): number => {
                      return this.rndService.get() - 0.5;
                    });
                  break;
              }
            }

            return c;
          })
        );
      })
    );
  }
}


