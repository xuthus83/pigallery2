import {expect} from 'chai';
import {PersonManager} from '../../../../../src/backend/model/database/sql/PersonManager';
import {SQLTestHelper} from '../../../SQLTestHelper';
import {TestHelper} from './TestHelper';
import {PhotoDTO} from '../../../../../src/common/entities/PhotoDTO';
import {PersonEntry} from '../../../../../src/backend/model/database/sql/enitites/PersonEntry';
import {FaceRegionEntry} from '../../../../../src/backend/model/database/sql/enitites/FaceRegionEntry';
import {SQLConnection} from '../../../../../src/backend/model/database/sql/SQLConnection';
import {PhotoEntity} from '../../../../../src/backend/model/database/sql/enitites/PhotoEntity';
import {DirectoryEntity} from '../../../../../src/backend/model/database/sql/enitites/DirectoryEntity';
import {VideoEntity} from '../../../../../src/backend/model/database/sql/enitites/VideoEntity';


// to help WebStorm to handle the test cases
declare let describe: any;
declare const after: any;
declare const it: any;


describe = SQLTestHelper.describe;

describe('PersonManager', (sqlHelper: SQLTestHelper) => {


  const dir = TestHelper.getDirectoryEntry();
  const p = TestHelper.getPhotoEntry1(dir);
  const p2 = TestHelper.getPhotoEntry2(dir);
  const p_faceLess = TestHelper.getPhotoEntry2(dir);
  delete p_faceLess.metadata.faces;
  p_faceLess.name = 'fl';
  const v = TestHelper.getVideoEntry1(dir);

  const setUpSqlDB = async () => {
    await sqlHelper.initDB();

    const savePhoto = async (photo: PhotoDTO) => {
      const savedPhoto = await pr.save(photo);
      if (!photo.metadata.faces) {
        return;
      }
      for (let i = 0; i < photo.metadata.faces.length; i++) {
        const face = photo.metadata.faces[i];
        const person = await conn.getRepository(PersonEntry).save({name: face.name});
        await conn.getRepository(FaceRegionEntry).save({box: face.box, person: person, media: savedPhoto});
      }
    };
    const conn = await SQLConnection.getConnection();

    const pr = conn.getRepository(PhotoEntity);

    await conn.getRepository(DirectoryEntity).save(p.directory);
    await savePhoto(p);
    await savePhoto(p2);
    await savePhoto(p_faceLess);

    await conn.getRepository(VideoEntity).save(v);

    await SQLConnection.close();
  };


  beforeEach(async () => {
    await setUpSqlDB();
  });

  after(async () => {
    await sqlHelper.clearDB();
  });


  it('should get sample photos', async () => {
    const pm = new PersonManager();
    const map: { [key: string]: PhotoDTO } = {};
    p.metadata.faces.forEach(face => {
      map[face.name] = <any>{
        id: p.id,
        name: p.name,
        directory: {
          path: p.directory.path,
          name: p.directory.name,
        },
        metadata: {
          size: p.metadata.size,
          faces: [p.metadata.faces.find(f => f.name === face.name)]
        },
        readyIcon: false,
        readyThumbnails: []
      };

    });
    expect(await pm.getSamplePhotos(p.metadata.faces.map(f => f.name))).to.deep.equal(map);
  });

});
