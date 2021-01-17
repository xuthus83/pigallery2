import {expect} from 'chai';
import {PersonManager} from '../../../../../src/backend/model/database/sql/PersonManager';
import {SQLTestHelper} from '../../../SQLTestHelper';
import {TestHelper} from './TestHelper';
import {PhotoDTO, PhotoMetadata} from '../../../../../src/common/entities/PhotoDTO';
import {Utils} from '../../../../../src/common/Utils';
import {PersonWithSampleRegion} from '../../../../../src/common/entities/PersonDTO';
import {DirectoryDTO} from '../../../../../src/common/entities/DirectoryDTO';
import {VideoDTO} from '../../../../../src/common/entities/VideoDTO';
import {SQLConnection} from '../../../../../src/backend/model/database/sql/SQLConnection';
import {PersonEntry} from '../../../../../src/backend/model/database/sql/enitites/PersonEntry';
import {MediaDTO} from '../../../../../src/common/entities/MediaDTO';


// to help WebStorm to handle the test cases
declare let describe: any;
declare const after: any;
declare const it: any;


describe = SQLTestHelper.describe;

describe('PersonManager', (sqlHelper: SQLTestHelper) => {


  let dir: DirectoryDTO;

  let v: VideoDTO;
  let p: PhotoDTO;
  let p2: PhotoDTO;
  let p_faceLess: PhotoDTO;

  let savedPerson: PersonWithSampleRegion[] = [];

  const setUpSqlDB = async () => {
    await sqlHelper.initDB();
    const directory: DirectoryDTO = TestHelper.getDirectoryEntry();
    TestHelper.getPhotoEntry1(directory);
    TestHelper.getPhotoEntry2(directory);
    const pFaceLess = TestHelper.getPhotoEntry3(directory);
    delete pFaceLess.metadata.faces;
    TestHelper.getVideoEntry1(directory);

    dir = await SQLTestHelper.persistTestDir(directory);
    p = <any>dir.media[0];
    p2 = <any>dir.media[1];
    p_faceLess = <any>dir.media[2];
    v = <any>dir.media[3];
    savedPerson = await (await SQLConnection.getConnection()).getRepository(PersonEntry).find({
      relations: ['sampleRegion',
        'sampleRegion.media',
        'sampleRegion.media.directory']
    });
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

    expect(await pm.get('Boba Fett')).to.deep.equal(person);

    expect((await pm.get('Boba Fett') as PersonWithSampleRegion).sampleRegion.media.name).to.deep.equal(p.name);
  });


});
