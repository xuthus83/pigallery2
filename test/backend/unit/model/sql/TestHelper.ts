import {MediaDimensionEntity} from '../../../../../backend/model/sql/enitites/MediaEntity';
import {
  CameraMetadataEntity,
  GPSMetadataEntity, PhotoEntity,
  PhotoMetadataEntity,
  PositionMetaDataEntity
} from '../../../../../backend/model/sql/enitites/PhotoEntity';
import * as path from 'path';
import {OrientationTypes} from 'ts-exif-parser';
import {DirectoryEntity} from '../../../../../backend/model/sql/enitites/DirectoryEntity';
import {Utils} from '../../../../../common/Utils';
import {VideoEntity, VideoMetadataEntity} from '../../../../../backend/model/sql/enitites/VideoEntity';

export class TestHelper {

  public static getDirectoryEntry() {

    const dir = new DirectoryEntity();
    dir.name = 'wars dir';
    dir.path = '.';
    dir.lastModified = Date.now();
    dir.lastScanned = null;

    return dir;
  }

  public static getPhotoEntry(dir: DirectoryEntity) {
    const sd = new MediaDimensionEntity();
    sd.height = 200;
    sd.width = 200;
    const gps = new GPSMetadataEntity();
    gps.altitude = 1;
    gps.latitude = 1;
    gps.longitude = 1;
    const pd = new PositionMetaDataEntity();
    pd.city = 'New York';
    pd.country = 'Alderan';
    pd.state = 'Kamino';
    pd.GPSData = gps;
    const cd = new CameraMetadataEntity();
    cd.ISO = 100;
    cd.model = '60D';
    cd.maker = 'Canon';
    cd.fStop = 1;
    cd.exposure = 1;
    cd.focalLength = 1;
    cd.lens = 'Lens';
    const m = new PhotoMetadataEntity();
    m.keywords = ['apple'];
    m.cameraData = cd;
    m.positionData = pd;
    m.size = sd;
    m.creationDate = Date.now();
    m.fileSize = 123456789;
    m.orientation = OrientationTypes.TOP_LEFT;

    // TODO: remove when typeorm is fixed
    m.duration = null;
    m.bitRate = null;


    const d = new PhotoEntity();
    d.name = 'test media.jpg';
    d.directory = dir;
    d.metadata = m;
    return d;
  }

  public static getVideoEntry(dir: DirectoryEntity) {
    const sd = new MediaDimensionEntity();
    sd.height = 200;
    sd.width = 200;

    const m = new VideoMetadataEntity();
    m.keywords = null;
    m.size = sd;
    m.creationDate = Date.now();
    m.fileSize = 123456789;

    m.duration = 10000;
    m.bitRate = 4000;


    const d = new VideoEntity();
    d.name = 'test video.jpg';
    d.directory = dir;
    d.metadata = m;
    return d;
  }

  public static getPhotoEntry1(dir: DirectoryEntity) {
    const p = TestHelper.getPhotoEntry(dir);

    p.metadata.keywords = ['Boba Fett', 'star wars', 'Anakin', 'death star'];
    p.metadata.positionData.city = 'Mos Eisley';
    p.metadata.positionData.country = 'Tatooine';
    p.name = 'sw1';
    return p;
  }

  public static getVideoEntry1(dir: DirectoryEntity) {
    const p = TestHelper.getVideoEntry(dir);
    p.name = 'swVideo';
    return p;
  }

  public static getPhotoEntry2(dir: DirectoryEntity) {
    const p = TestHelper.getPhotoEntry(dir);

    p.metadata.keywords = ['Padmé Amidala', 'star wars', 'Natalie Portman', 'death star'];
    p.metadata.positionData.city = 'Derem City';
    p.metadata.positionData.state = 'Research City';
    p.metadata.positionData.country = 'Kamino';
    p.name = 'sw2';
    return p;
  }


  public static getRandomizedDirectoryEntry(parent: DirectoryEntity = null, forceStr = null) {

    const dir = new DirectoryEntity();
    dir.name = forceStr || Math.random().toString(36).substring(7);
    dir.path = '.';
    if (parent !== null) {
      dir.path = path.join(parent.path, parent.name);
      parent.directories.push(dir);
    }
    dir.directories = [];
    dir.media = [];
    dir.lastModified = Date.now();
    dir.lastScanned = null;

    return dir;
  }

  public static getRandomizedPhotoEntry(dir: DirectoryEntity, forceStr = null) {


    const rndStr = () => {
      return forceStr + '_' + Math.random().toString(36).substring(7);
    };


    const rndInt = (max = 5000) => {
      return Math.floor(Math.random() * max);
    };

    const sd = new MediaDimensionEntity();
    sd.height = rndInt();
    sd.width = rndInt();
    const gps = new GPSMetadataEntity();
    gps.altitude = rndInt(1000);
    gps.latitude = rndInt(1000);
    gps.longitude = rndInt(1000);
    const pd = new PositionMetaDataEntity();
    pd.city = rndStr();
    pd.country = rndStr();
    pd.state = rndStr();
    pd.GPSData = gps;
    const cd = new CameraMetadataEntity();
    cd.ISO = rndInt(500);
    cd.model = rndStr();
    cd.maker = rndStr();
    cd.fStop = rndInt(10);
    cd.exposure = rndInt(10);
    cd.focalLength = rndInt(10);
    cd.lens = rndStr();
    const m = new PhotoMetadataEntity();
    m.keywords = [rndStr(), rndStr()];
    m.cameraData = cd;
    m.positionData = pd;
    m.size = sd;
    m.creationDate = Date.now();
    m.fileSize = rndInt(10000);
    m.orientation = OrientationTypes.TOP_LEFT;

    // TODO: remove when typeorm is fixed
    m.duration = null;
    m.bitRate = null;


    const d = new PhotoEntity();
    d.name = rndStr() + '.jpg';
    d.directory = dir;
    d.metadata = m;

    dir.media.push(d);
    return d;
  }


}
