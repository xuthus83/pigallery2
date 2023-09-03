import {Injectable} from '@angular/core';
import {NetworkService} from '../../model/network/network.service';
import {ContentWrapper} from '../../../../common/entities/ConentWrapper';
import {SubDirectoryDTO,} from '../../../../common/entities/DirectoryDTO';
import {GalleryCacheService} from './cache.gallery.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Config} from '../../../../common/config/public/Config';
import {ShareService} from './share.service';
import {NavigationService} from '../../model/navigation.service';
import {QueryParams} from '../../../../common/QueryParams';
import {ErrorCodes} from '../../../../common/entities/Error';
import {map} from 'rxjs/operators';
import {MediaDTO} from '../../../../common/entities/MediaDTO';
import {FileDTO} from '../../../../common/entities/FileDTO';
import {GallerySortingService, GroupedDirectoryContent} from './navigator/sorting.service';
import {FilterService} from './filter/filter.service';
import {ContentLoaderService} from './contentLoader.service';

@Injectable()
export class ContentService {
  public sortedFilteredContent: Observable<GroupedDirectoryContent>;

  constructor(
    private contentLoaderService: ContentLoaderService,
    private sortingService: GallerySortingService,
    private filterService: FilterService
  ) {
    this.sortedFilteredContent = this.sortingService
      .applySorting(
        this.filterService.applyFilters(this.contentLoaderService.originalContent)
      );

  }

}
