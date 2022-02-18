import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FilterOption, FilterService, SelectedFilter} from './filter.service';
import {OnDestroy, OnInit} from '../../../../../../node_modules/@angular/core';

@Component({
  selector: 'app-gallery-filter',
  styleUrls: ['./filter.gallery.component.css'],
  templateUrl: './filter.gallery.component.html',
  providers: [RouterLink],
})
export class GalleryFilterComponent implements OnInit, OnDestroy {
  public readonly unknownText;

  constructor(public filterService: FilterService) {
    this.unknownText = '<' + $localize`unknown` + '>';
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

  toggleSelectOnly(filter: SelectedFilter, option: FilterOption, event: MouseEvent): void {
    if (this.isOnlySelected(filter, option)) {
      filter.options.forEach(o => o.selected = true);
    } else {
      filter.options.forEach(o => o.selected = (o === option));
    }
    event.stopPropagation();
    this.filterService.onFilterChange();
  }
}

