import {Component} from '@angular/core';
import {DuplicateService} from './duplicates.service';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {Utils} from '../../../common/Utils';
import {QueryService} from '../model/query.service';

@Component({
  selector: 'app-duplicate',
  templateUrl: './duplicates.component.html',
  styleUrls: ['./duplicates.component.css']
})
export class DuplicateComponent {
  constructor(public _duplicateService: DuplicateService,
              public queryService: QueryService) {
    this._duplicateService.getDuplicates().catch(console.error);
  }

  getDirectoryPath(media: MediaDTO) {
    return Utils.concatUrls(media.directory.path, media.directory.name);
  }
}

