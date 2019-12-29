import {Injectable} from '@angular/core';
import {I18n} from '@ngx-translate/i18n-polyfill';
import {backendText, backendTexts} from '../../../common/BackendTexts';

@Injectable()
export class BackendtextService {


  constructor(private i18n: I18n) {
  }

  public get(id: backendText): string {
    switch (id) {
      case backendTexts.sizeToGenerate.name:
        return this.i18n('Size to generate');
      case backendTexts.sizeToGenerate.description:
        return this.i18n('These thumbnails will be generated. The list should be a subset of the enabled thumbnail sizes');
      case backendTexts.indexedFilesOnly.name:
        return this.i18n('Indexed only');
      case backendTexts.indexedFilesOnly.description:
        return this.i18n('Only checks indexed files.');
      default:
        return null;
    }
  }
}
