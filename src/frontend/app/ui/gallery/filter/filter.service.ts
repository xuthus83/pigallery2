import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {PhotoDTO} from '../../../../../common/entities/PhotoDTO';
import {DirectoryContent} from '../content.service';
import {map, mergeMap} from 'rxjs/operators';

export enum FilterRenderType {
  enum = 1, range = 2
}

interface Filter {
  name: string;
  mapFn: (m: PhotoDTO) => (string | number)[] | (string | number);
  renderType: FilterRenderType;
  isArrayValue?: boolean;
}

interface SelectedFilter {
  filter: Filter;
  options: { name: string, count: number, selected: boolean }[];
}

@Injectable()
export class FilterService {
  public readonly AVAILABLE_FILTERS: Filter[] = [
    {
      name: $localize`Keywords`,
      mapFn: (m: PhotoDTO): string[] => m.metadata.keywords,
      renderType: FilterRenderType.enum,
      isArrayValue: true,
    },
    {
      name: $localize`Faces`,
      mapFn: (m: PhotoDTO): string[] => m.metadata.faces?.map(f => f.name),
      renderType: FilterRenderType.enum,
      isArrayValue: true,
    },
    /*  {
        name: $localize`Date`,
        mapFn: (m: PhotoDTO): number => m.metadata.creationDate,
        renderType: FilterRenderType.date
      },*/


    {
      name: $localize`Rating`,
      mapFn: (m: PhotoDTO): number => m.metadata.rating,
      renderType: FilterRenderType.enum
    },
    {
      name: $localize`Camera`,
      mapFn: (m: PhotoDTO): string => m.metadata.cameraData?.model,
      renderType: FilterRenderType.enum
    },
    {
      name: $localize`City`,
      mapFn: (m: PhotoDTO): string => m.metadata.positionData?.city,
      renderType: FilterRenderType.enum
    },
    {
      name: $localize`State`,
      mapFn: (m: PhotoDTO): string => m.metadata.positionData?.state,
      renderType: FilterRenderType.enum
    },
    {
      name: $localize`Country`,
      mapFn: (m: PhotoDTO): string => m.metadata.positionData?.country,
      renderType: FilterRenderType.enum
    },
  ];

  public readonly selectedFilters = new BehaviorSubject<SelectedFilter[]>([
    {
      filter: this.AVAILABLE_FILTERS[0],
      options: []
    }, {
      filter: this.AVAILABLE_FILTERS[1],
      options: []
    }, {
      filter: this.AVAILABLE_FILTERS[4],
      options: []
    }, {
      filter: this.AVAILABLE_FILTERS[2],
      options: []
    }
  ]);
  filtersVisible = false;

  constructor() {
  }

  public applyFilters(directoryContent: Observable<DirectoryContent>): Observable<DirectoryContent> {
    return directoryContent.pipe(mergeMap((dirContent: DirectoryContent) => {
      return this.selectedFilters.pipe(map((filters: SelectedFilter[]) => {
        if (!dirContent || !dirContent.media || !this.filtersVisible) {
          return dirContent;
        }

        // clone, so the original won't get overwritten
        const c = {
          media: dirContent.media,
          directories: dirContent.directories,
          metaFile: dirContent.metaFile
        };
        for (const f of filters) {

          // get options
          const valueMap: { [key: string]: any } = {};
          f.options.forEach(o => {
            valueMap[o.name] = o;
            o.count = 0; // reset count so unknown option can be removed at the end
          });

          if (f.filter.isArrayValue) {
            c.media.forEach(m => {
              (f.filter.mapFn(m as PhotoDTO) as string[])?.forEach(v => {
                valueMap[v] = valueMap[v] || {name: v, count: 0, selected: true};
                valueMap[v].count++;
              });
            });
          } else {
            c.media.forEach(m => {
              const key = f.filter.mapFn(m as PhotoDTO) as string;
              valueMap[key] = valueMap[key] || {name: key, count: 0, selected: true};
              valueMap[key].count++;
            });
          }

          f.options = Object.values(valueMap).filter(o => o.count > 0).sort((a, b) => b.count - a.count);


          // apply filters
          f.options.forEach(opt => {
            if (opt.selected) {
              return;
            }
            if (f.filter.isArrayValue) {
              c.media = c.media.filter(m => {
                const mapped = (f.filter.mapFn(m as PhotoDTO) as string[]);
                if (!mapped) {
                  return true;
                }
                return mapped.indexOf(opt.name) === -1;
              });
            } else {
              c.media = c.media.filter(m => (f.filter.mapFn(m as PhotoDTO) as string) !== opt.name);
            }

          });

        }
        return c;
      }));
    }));
  }

  public onFilterChange(): void {
    this.selectedFilters.next(this.selectedFilters.value);
  }

  setShowingFilters(value: boolean): void {
    if (this.filtersVisible === value) {
      return;
    }
    this.filtersVisible = value;
    if (!this.filtersVisible) {
      this.selectedFilters.value.forEach(f => f.options = []);
    }
    this.onFilterChange();
  }
}


