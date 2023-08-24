import {Component, Input} from '@angular/core';
import {SortingMethods} from '../../../../common/entities/SortingMethods';

@Component({
  selector: 'app-sorting-method-icon',
  templateUrl: './sorting-method-icon.component.html',
  styleUrls: ['./sorting-method-icon.component.css']
})
export class SortingMethodIconComponent {
  @Input() method: SortingMethods;
  SortingMethods = SortingMethods;
}
