import {Injectable} from '@angular/core';
import {DatePipe} from '@angular/common';
import {NetworkService} from '../../../model/network/network.service';
import {GalleryCacheService} from '../cache.gallery.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Config} from '../../../../../common/config/public/Config';
import {GroupingMethod, SortByTypes, SortingMethod} from '../../../../../common/entities/SortingMethods';
import {PG2ConfMap} from '../../../../../common/PG2ConfMap';
import {ContentService, DirectoryContent} from '../content.service';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {map, switchMap} from 'rxjs/operators';
import {SeededRandomService} from '../../../model/seededRandom.service';
import {ContentWrapper} from '../../../../../common/entities/ConentWrapper';
import {SubDirectoryDTO} from '../../../../../common/entities/DirectoryDTO';
import {MediaDTO} from '../../../../../common/entities/MediaDTO';
import {FileDTO} from '../../../../../common/entities/FileDTO';

@Injectable()
export class GallerySortingService {
  public sorting: BehaviorSubject<SortingMethod>;
  public grouping: BehaviorSubject<GroupingMethod>;
  private collator = new Intl.Collator(undefined, {numeric: true});

  constructor(
    private networkService: NetworkService,
    private galleryCacheService: GalleryCacheService,
    private galleryService: ContentService,
    private rndService: SeededRandomService,
    private datePipe: DatePipe
  ) {
    this.sorting = new BehaviorSubject(
      {method: Config.Gallery.defaultPhotoSortingMethod.method, ascending: Config.Gallery.defaultPhotoSortingMethod.ascending}
    );
    this.grouping = new BehaviorSubject(
      {method: Config.Gallery.defaultPhotoGroupingMethod.method, ascending: Config.Gallery.defaultPhotoGroupingMethod.ascending}
    );
    this.galleryService.content.subscribe((c) => {
      if (c) {
        const sort = this.galleryCacheService.getSorting(c);
        const group = this.galleryCacheService.getGrouping(c);
        if (sort !== null) {
          this.sorting.next(sort);
        } else {
          this.sorting.next(this.getDefaultSorting(c));
        }
        if (group !== null) {
          this.grouping.next(group);
        } else {
          this.grouping.next(this.getDefaultGrouping(c));
        }
      }
    });
  }

  isDefaultSortingAndGrouping(cw: ContentWrapper): boolean {
    const defS = this.getDefaultSorting(cw);
    const defG = this.getDefaultGrouping(cw);
    const s = this.sorting.value;
    const g = this.grouping.value;
    return s.method === defS.method && s.ascending === defS.ascending &&
      g.method === defG.method && g.ascending === defG.ascending;
  }

  getDefaultSorting(cw: ContentWrapper): SortingMethod {
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


  getDefaultGrouping(cw: ContentWrapper): GroupingMethod {
    if (cw.searchResult) {
      return Config.Gallery.defaultSearchGroupingMethod;
    }
    return Config.Gallery.defaultPhotoGroupingMethod;
  }

  setSorting(sorting: SortingMethod): void {
    this.sorting.next(sorting);
    if (this.galleryService.content.value) {
      if (
        sorting !==
        this.getDefaultSorting(this.galleryService.content.value)
      ) {
        this.galleryCacheService.setSorting(
          this.galleryService.content.value,
          sorting
        );
      } else {
        this.galleryCacheService.removeSorting(
          this.galleryService.content.value
        );
      }
    }
  }

  setGrouping(grouping: GroupingMethod): void {
    this.grouping.next(grouping);
    if (this.galleryService.content.value) {
      if (
        grouping !==
        this.getDefaultGrouping(this.galleryService.content.value)
      ) {
        this.galleryCacheService.setGrouping(
          this.galleryService.content.value,
          grouping
        );
      } else {
        this.galleryCacheService.removeGrouping(
          this.galleryService.content.value
        );
      }
    }
  }

  private sortMedia(sorting: SortingMethod | GroupingMethod, media: MediaDTO[]): void {
    if (!media) {
      return;
    }
    switch (sorting.method) {
      case SortByTypes.Name:
        media.sort((a: PhotoDTO, b: PhotoDTO) =>
          this.collator.compare(a.name, b.name)
        );
        break;
      case SortByTypes.Date:
        media.sort((a: PhotoDTO, b: PhotoDTO): number => {
          return a.metadata.creationDate - b.metadata.creationDate;
        });
        break;
      case SortByTypes.Rating:
        media.sort(
          (a: PhotoDTO, b: PhotoDTO) =>
            (a.metadata.rating || 0) - (b.metadata.rating || 0)
        );
        break;
      case SortByTypes.PersonCount:
        media.sort(
          (a: PhotoDTO, b: PhotoDTO) =>
            (a.metadata?.faces?.length || 0) - (b.metadata?.faces?.length || 0)
        );
        break;
      case SortByTypes.FileSize:
        media.sort(
          (a: PhotoDTO, b: PhotoDTO) =>
            (a.metadata?.fileSize || 0) - (b.metadata?.fileSize || 0)
        );
        break;
      case SortByTypes.Random:
        this.rndService.setSeed(media.length);
        media.sort((a: PhotoDTO, b: PhotoDTO): number => {
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
    if (!sorting.ascending) {
      media.reverse();
    }
    return;
  }

  public applySorting(
    directoryContent: Observable<DirectoryContent>
  ): Observable<GroupedDirectoryContent> {
    return directoryContent.pipe(
      switchMap((dirContent) => {
        return this.grouping.pipe(
          switchMap((grouping) => {
            return this.sorting.pipe(
              map((sorting) => {
                if (!dirContent) {
                  return null;
                }
                const c: GroupedDirectoryContent = {
                  mediaGroups: [],
                  directories: dirContent.directories,
                  metaFile: dirContent.metaFile,
                };
                if (c.directories) {
                  switch (sorting.method) {
                    case SortByTypes.FileSize:
                    case SortByTypes.PersonCount:
                    case SortByTypes.Rating: // directories do not have rating
                    case SortByTypes.Name:
                      c.directories.sort((a, b) =>
                        this.collator.compare(a.name, b.name)
                      );
                      break;
                    case SortByTypes.Date:
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
                    case SortByTypes.Random:
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

                  if (!sorting.ascending) {
                    c.directories.reverse();
                  }
                }

                // group
                if (dirContent.media) {
                  const mCopy = dirContent.media;
                  this.sortMedia(grouping, mCopy);
                  let groupFN = (m: MediaDTO) => '';
                  switch (grouping.method) {
                    case SortByTypes.Date:
                      groupFN = (m: MediaDTO) => this.datePipe.transform(m.metadata.creationDate, 'longDate');
                      break;
                    case SortByTypes.Name:
                      groupFN = (m: MediaDTO) => m.name.at(0).toUpperCase();
                      break;
                    case SortByTypes.Rating:
                      groupFN = (m: MediaDTO) => ((m as PhotoDTO).metadata.rating || 0).toString();
                      break;
                    case SortByTypes.FileSize: {
                      const groups = [0.5, 1, 2, 5, 10, 15, 20, 30, 50]; // MBs
                      groupFN = (m: MediaDTO) => {
                        const mbites = ((m as PhotoDTO).metadata.fileSize || 0) / 1024 / 1024;
                        const i = groups.findIndex((s) => s > mbites);
                        if (i == -1) {
                          return '>' + groups[groups.length - 1] + ' MB';
                        } else if (i == 0) {
                          return '<' + groups[0] + ' MB';
                        }
                        return groups[i - 1] + ' - ' + groups[i] + ' MB';
                      };
                    }
                      break;
                    case SortByTypes.PersonCount:
                      groupFN = (m: MediaDTO) => ((m as PhotoDTO).metadata.faces || []).length.toString();
                      break;
                  }
                  c.mediaGroups = [];
                  for (const m of mCopy) {
                    const k = groupFN(m);
                    if (c.mediaGroups.length == 0 || c.mediaGroups[c.mediaGroups.length - 1].name != k) {
                      c.mediaGroups.push({name: k, media: []});
                    }
                    c.mediaGroups[c.mediaGroups.length - 1].media.push(m);
                  }
                  c.mediaGroups;
                }

                // sort groups
                for (let i = 0; i < c.mediaGroups.length; ++i) {
                  this.sortMedia(sorting, c.mediaGroups[i].media);
                }

                return c;
              })
            );
          })
        );
      })
    );
  }
}

export interface MediaGroup {
  name: string;
  media: MediaDTO[];
}

export interface GroupedDirectoryContent {
  directories: SubDirectoryDTO[];
  mediaGroups: MediaGroup[];
  metaFile: FileDTO[];
}


