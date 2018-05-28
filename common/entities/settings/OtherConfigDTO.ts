import {SortingMethods} from '../SortingMethods';

export interface OtherConfigDTO {
  enableCache: boolean;
  enableOnScrollRendering: boolean;
  enableOnScrollThumbnailPrioritising: boolean;
  enableThreading: boolean;
  defaultPhotoSortingMethod: SortingMethods;
}
