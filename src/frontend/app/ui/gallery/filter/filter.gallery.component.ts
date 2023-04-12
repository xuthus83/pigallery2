import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FilterOption, FilterService, SelectedFilter} from './filter.service';

@Component({
  selector: 'app-gallery-filter',
  styleUrls: ['./filter.gallery.component.css'],
  templateUrl: './filter.gallery.component.html',
  providers: [RouterLink],
})
export class GalleryFilterComponent implements OnInit, OnDestroy {
  public readonly unknownText;
  minDate = 0;
  maxDate = 100;
  NUMBER_MAX_VALUE = Number.MAX_VALUE;
  NUMBER_MIN_VALUE = Number.MIN_VALUE;
  showStatistic = false;

  constructor(public filterService: FilterService) {
    this.unknownText = '<' + $localize`unknown` + '>';
  }

  get MinDatePrc(): number {
    return (
      ((this.ActiveFilters.dateFilter.minFilter -
          this.ActiveFilters.dateFilter.minDate) /
        (this.ActiveFilters.dateFilter.maxDate -
          this.ActiveFilters.dateFilter.minDate)) *
      100
    );
  }

  get MaxDatePrc(): number {
    return (
      ((this.ActiveFilters.dateFilter.maxFilter -
          this.ActiveFilters.dateFilter.minDate) /
        (this.ActiveFilters.dateFilter.maxDate -
          this.ActiveFilters.dateFilter.minDate)) *
      100
    );
  }

  get ActiveFilters(): {
    filtersVisible: boolean;
    areFiltersActive: boolean;
    dateFilter: {
      minDate: number;
      maxDate: number;
      minFilter: number;
      maxFilter: number;
    };
    selectedFilters: SelectedFilter[];
  } {
    return this.filterService.activeFilters.value;
  }

  get MediaCountOverTime(): { date: Date, endDate: Date, dateStr: string, count: number, max: number }[] {
    if (!this.filterService.prefiltered ||
      !this.filterService.prefiltered.media ||
      this.filterService.prefiltered.media.length === 0) {
      return [];
    }
    const ret: { date: Date, endDate: Date, dateStr: string, count: number, max: number }[] = [];
    const diff = (this.ActiveFilters.dateFilter.maxDate - this.ActiveFilters.dateFilter.minDate) / 1000;
    const H = 60 * 60;
    const D = H * 24;
    const M = D * 30;
    const Y = D * 365;
    const Dec = Y * 10;
    const Sen = Y * 100;
    const divs = [H, D, M, Y, Dec, Sen];
    const startMediaTime = this.filterService.prefiltered.media.reduce((p, c) => p.metadata.creationDate < c.metadata.creationDate ? p : c).metadata.creationDate;

    // finding the resolution
    let usedDiv = H;
    for (let i = 0; i < divs.length; ++i) {
      if (diff / divs[i] < 15) {
        usedDiv = divs[i];
        break;
      }
    }

    // getting the first date (truncated to the resolution)
    let startMediaDate = new Date(startMediaTime);
    if (usedDiv >= Y) {
      const fy = (new Date(startMediaTime).getFullYear());
      startMediaDate = new Date(fy - fy % (usedDiv / Y), 0, 1);
    } else if (usedDiv === M) {
      startMediaDate = new Date(startMediaDate.getFullYear(), startMediaDate.getMonth(), 1);
    } else {
      startMediaDate = new Date(startMediaTime - startMediaTime % usedDiv);
    }

    this.filterService.prefiltered.media.forEach(m => {
      const key = Math.floor((m.metadata.creationDate - startMediaTime) / 1000 / usedDiv);

      const getDate = (index: number) => {
        let d: Date;
        if (usedDiv >= Y) {
          d = new Date(startMediaDate.getFullYear() + (index * (usedDiv / Y)), 0, 1);
        } else if (usedDiv === M) {
          d = new Date(startMediaDate.getFullYear(), startMediaDate.getMonth() + index, 1);
        } else if (usedDiv === D) {
          d = new Date(startMediaDate.getFullYear(), startMediaDate.getMonth(), startMediaDate.getDate() + index, 1);
        } else {
          d = (new Date(startMediaDate.getTime() + (index * usedDiv * 1000)));
        }
        return d;
      };
      // extending the array
      while (ret.length <= key) {
        let dStr: string;
        // getting date range start for entry and also UI date pattern
        if (usedDiv >= Y) {
          dStr = 'yyyy';
        } else if (usedDiv === M) {
          dStr = 'MMM';
        } else if (usedDiv === D) {
          dStr = 'EEE';
        } else {
          dStr = 'HH';
        }
        ret.push({date: getDate(ret.length), endDate: getDate(ret.length + 1), dateStr: dStr, count: 0, max: 0});
      }

      ret[key].count++;
    });

    // don't show if there is only one column
    if (ret.length <= 1) {
      return [];
    }

    const max = ret.reduce((p, c) => Math.max(p, c.count), 0);
    ret.forEach(v => v.max = max);
    return ret;
  }

  ngOnDestroy(): void {
    setTimeout(() => this.filterService.setShowingFilters(false));
  }

  ngOnInit(): void {
    this.filterService.setShowingFilters(true);
  }

  isOnlySelected(filter: SelectedFilter, option: FilterOption): boolean {
    for (const o of filter.options) {
      if (o === option) {
        if (o.selected === false) {
          return false;
        }
      } else {
        if (o.selected === true) {
          return false;
        }
      }
    }
    return true;
  }

  toggleSelectOnly(
    filter: SelectedFilter,
    option: FilterOption,
    event: MouseEvent
  ): void {
    if (this.isOnlySelected(filter, option)) {
      filter.options.forEach((o) => (o.selected = true));
    } else {
      filter.options.forEach((o) => (o.selected = o === option));
    }
    event.stopPropagation();
    this.filterService.onFilterChange();
  }

  newMinDate($event: Event): void {
    const diff =
      (this.ActiveFilters.dateFilter.maxDate -
        this.ActiveFilters.dateFilter.minDate) *
      0.01;
    if (
      this.ActiveFilters.dateFilter.minFilter >
      this.ActiveFilters.dateFilter.maxFilter - diff
    ) {
      this.ActiveFilters.dateFilter.minFilter = Math.max(
        this.ActiveFilters.dateFilter.maxFilter - diff,
        this.ActiveFilters.dateFilter.minDate
      );
    }
    this.filterService.onFilterChange();
  }

  newMaxDate($event: Event): void {
    const diff =
      (this.ActiveFilters.dateFilter.maxDate -
        this.ActiveFilters.dateFilter.minDate) *
      0.01;
    if (
      this.ActiveFilters.dateFilter.maxFilter <
      this.ActiveFilters.dateFilter.minFilter + diff
    ) {
      this.ActiveFilters.dateFilter.maxFilter = Math.min(
        this.ActiveFilters.dateFilter.minFilter + diff,
        this.ActiveFilters.dateFilter.maxDate
      );
    }
    this.filterService.onFilterChange();
  }

  reset(): void {
    this.filterService.resetFilters();
  }
}

