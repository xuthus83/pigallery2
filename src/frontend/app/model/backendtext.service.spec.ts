import {inject, TestBed} from '@angular/core/testing';
import {BackendtextService} from './backendtext.service';
import {backendTexts} from '../../../common/BackendTexts';

describe('BackendTextService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackendtextService],
    });
  });

  it('should have valid text for all keys', inject(
      [BackendtextService],
      (backendTextService: BackendtextService) => {
        const getTexts = (obj: any) => {
          for (const key of Object.keys(obj)) {
            if (typeof obj[key] === 'object') {
              getTexts(obj[key]);
              continue;
            }
            expect(backendTextService.get(obj[key])).not.toEqual(null, 'Error for key: ' + obj[key] + ', ' + key);
          }
        };
        getTexts(backendTexts);
      }
  ));
});
