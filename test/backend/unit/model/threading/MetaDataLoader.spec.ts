import {expect} from 'chai';
import {MetadataLoader} from '../../../../../backend/model/threading/MetadataLoader';
import {Utils} from '../../../../../common/Utils';
import * as path from 'path';

describe('MetadataLoader', () => {

  it('should load png', async () => {
    const data = await MetadataLoader.loadPhotoMetadata(path.join(__dirname, '/../../assets/test_png.png'));
    expect(Utils.clone(data)).to.be.deep.equal(Utils.clone({
      creationDate: 1545342192328,
      fileSize: 2110,
      orientation: 1,
      size: {
        height: 26,
        width: 26
      }
    }));
  });

  it('should load jpg', async () => {
    const data = await MetadataLoader.loadPhotoMetadata(path.join(__dirname, '/../../assets/test image öüóőúéáű-.,.jpg'));
    expect(Utils.clone(data)).to.be.deep.equal(Utils.clone({
      size: {width: 140, height: 93},
      orientation: 1,
      caption: 'Test caption',
      creationDate: 1434018566000,
      fileSize: 62786,
      cameraData:
        {
          ISO: 3200,
          model: 'óüöúőűáé ÓÜÖÚŐŰÁÉ',
          make: 'Canon',
          fStop: 5.6,
          exposure: 0.00125,
          focalLength: 85,
          lens: 'EF-S15-85mm f/3.5-5.6 IS USM'
        },
      positionData:
        {
          GPSData:
            {
              latitude: 37.871093333333334,
              longitude: -122.25678,
              altitude: 102.4498997995992
            },
          country: 'mmóüöúőűáé ÓÜÖÚŐŰÁÉmm-.,|\\mm',
          state: 'óüöúőűáé ÓÜÖÚŐŰÁ',
          city: 'óüöúőűáé ÓÜÖÚŐŰÁ'
        },
      keywords: ['Berkley', 'USA', 'űáéúőóüö ŰÁÉÚŐÓÜÖ']
    }));
  });

});
