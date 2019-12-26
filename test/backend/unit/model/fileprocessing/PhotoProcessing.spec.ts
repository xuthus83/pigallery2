import {expect} from 'chai';
import {Config} from '../../../../../src/common/config/private/Config';
import {ProjectPath} from '../../../../../src/backend/ProjectPath';
import * as path from 'path';
import {PhotoProcessing} from '../../../../../src/backend/model/fileprocessing/PhotoProcessing';


describe('PhotoProcessing', () => {

  // tslint:disable:no-unused-expression
  it('should generate converted file path', async () => {

    Config.load();
    Config.Client.Media.Thumbnail.thumbnailSizes = [];
    ProjectPath.ImageFolder = path.join(__dirname, './../../assets');
    const photoPath = path.join(ProjectPath.ImageFolder, 'test_png.png');

    expect(await PhotoProcessing
      .isValidConvertedPath(PhotoProcessing.generateConvertedFilePath(photoPath)))
      .to.be.true;

    expect(await PhotoProcessing
      .isValidConvertedPath(PhotoProcessing.generateConvertedFilePath(photoPath + 'noPath')))
      .to.be.false;

    {
      const convertedPath = PhotoProcessing.generateConvertedFilePath(photoPath);
      Config.Server.Media.Photo.Converting.resolution = <any>1;
      expect(await PhotoProcessing.isValidConvertedPath(convertedPath)).to.be.false;
    }
  });

  // tslint:disable:no-unused-expression
  it('should generate converted thumbnail path', async () => {

    Config.load();
    Config.Server.Media.Photo.Converting.resolution = <any>null;
    Config.Client.Media.Thumbnail.thumbnailSizes = [10, 20];
    ProjectPath.ImageFolder = path.join(__dirname, './../../assets');
    const photoPath = path.join(ProjectPath.ImageFolder, 'test_png.png');

    for (let i = 0; i < Config.Client.Media.Thumbnail.thumbnailSizes.length; ++i) {
      const thSize = Config.Client.Media.Thumbnail.thumbnailSizes[i];
      expect(await PhotoProcessing
        .isValidConvertedPath(PhotoProcessing.generateThumbnailPath(photoPath, thSize)))
        .to.be.true;


      expect(await PhotoProcessing
        .isValidConvertedPath(PhotoProcessing.generateThumbnailPath(photoPath + 'noPath', thSize)))
        .to.be.false;
    }


    expect(await PhotoProcessing
      .isValidConvertedPath(PhotoProcessing.generateThumbnailPath(photoPath, 30)))
      .to.be.false;

  });

});
