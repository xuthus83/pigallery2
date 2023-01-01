import {Component} from '@angular/core';
import {SettingsService} from '../settings.service';

@Component({
  selector: 'app-settings-gallery-statistic',
  templateUrl: './gallery-statistic.component.html',
  styleUrls: ['./gallery-statistic.component.css']
})
export class GalleryStatisticComponent {

  constructor(public settingsService: SettingsService) {
  }

}
