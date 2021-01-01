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
import {Utils} from '../../../../../src/common/Utils';
import {PersonWithSampleRegion} from '../../../../../src/common/entities/PersonDTO';


// to help WebStorm to handle the test cases
declare let describe: any;
declare const after: any;
declare const it: any;


describe = SQLTestHelper.describe;

describe('PersonManager', (sqlHelper: SQLTestHelper) => {


  const dir = TestHelper.getDirectoryEntry();
  let p = TestHelper.getPhotoEntry1(dir);
  let p2 = TestHelper.getPhotoEntry2(dir);
  let p_faceLess = TestHelper.getPhotoEntry2(dir);
  delete p_faceLess.metadata.faces;
  p_faceLess.name = 'fl';
  const v = TestHelper.getVideoEntry1(dir);
  const savedPerson: PersonWithSampleRegion[] = [];

  const setUpSqlDB = async () => {
    await sqlHelper.initDB();

    const savePhoto = async (photo: PhotoDTO) => {
      const savedPhoto = await pr.save(photo);
      if (!photo.metadata.faces) {
        return savedPhoto;
      }
      for (let i = 0; i < photo.metadata.faces.length; i++) {
        const face = photo.metadata.faces[i];
        const person = await conn.getRepository(PersonEntry).save({name: face.name});
        savedPhoto.metadata.faces[i] = await conn.getRepository(FaceRegionEntry).save({box: face.box, person: person, media: savedPhoto});
        savedPerson.push(person);
      }
      return savedPhoto;
    };
    const conn = await SQLConnection.getConnection();

    const pr = conn.getRepository(PhotoEntity);

    await conn.getRepository(DirectoryEntity).save(p.directory);
    p = await savePhoto(p);
    console.log(p.id);
    p2 = await savePhoto(p2);
    p_faceLess = await savePhoto(p_faceLess);

    await conn.getRepository(VideoEntity).save(v);
    await (new PersonManager()).onGalleryIndexUpdate();
    await SQLConnection.close();
  };


  beforeEach(async () => {
    await setUpSqlDB();
  });

  after(async () => {
    await sqlHelper.clearDB();
  });


  it('should get person', async () => {
    const pm = new PersonManager();
    const person = Utils.clone(savedPerson[0]);
    person.sampleRegion = <any>{
      id: p.metadata.faces[0].id,
      box: p.metadata.faces[0].box
    };
    const tmp = p.metadata.faces;
    delete p.metadata.faces;
    person.sampleRegion.media = Utils.clone(p);
    p.metadata.faces = tmp;
    person.count = 1;
    expect(await pm.get(person.name)).to.deep.equal(person);
  });


});
