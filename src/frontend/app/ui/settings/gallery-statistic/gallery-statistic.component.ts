import {Component, OnInit} from '@angular/core';
import {SettingsService} from '../settings.service';

@Component({
  selector: 'app-settings-gallery-statistic',
  templateUrl: './gallery-statistic.component.html',
  styleUrls: ['./gallery-statistic.component.css']
})
export class GalleryStatisticComponent implements OnInit {

  constructor(
    public settingsService: SettingsService
  ) {
  }

  ngOnInit(): void {
  }

}
