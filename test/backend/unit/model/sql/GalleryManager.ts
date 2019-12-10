import {expect} from 'chai';
import {TestHelper} from './TestHelper';
import {SQLTestHelper} from '../../../SQLTestHelper';
import {GalleryManager} from '../../../../../src/backend/model/sql/GalleryManager';
import {IndexingManager} from '../../../../../src/backend/model/sql/IndexingManager';
import {DirectoryDTO} from '../../../../../src/common/entities/DirectoryDTO';
import {Utils} from '../../../../../src/common/Utils';
import {ObjectManagers} from '../../../../../src/backend/model/ObjectManagers';
import {PersonManager} from '../../../../../src/backend/model/sql/PersonManager';
import {MediaEntity} from '../../../../../src/backend/model/sql/enitites/MediaEntity';
import {VersionManager} from '../../../../../src/backend/model/sql/VersionManager';

class IndexingManagerTest extends IndexingManager {

  public async saveToDB(scannedDirectory: DirectoryDTO): Promise<void> {
    return super.saveToDB(scannedDirectory);
  }
}

// to help WebStorm to handle the test cases
declare let describe: any;
declare const after: any;
describe = SQLTestHelper.describe;

describe('GalleryManager', (sqlHelper: SQLTestHelper) => {


  beforeEach(async () => {
    await sqlHelper.initDB();
    ObjectManagers.getInstance().PersonManager = new PersonManager();
    ObjectManagers.getInstance().VersionManager = new VersionManager();
  });


  after(async () => {
    await sqlHelper.clearDB();
  });

  it('should get random photo', async () => {
    const gm = new GalleryManager();
    const im = new IndexingManagerTest();

    const parent = TestHelper.getRandomizedDirectoryEntry();
    const p1 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo1');
    expect(await gm.getRandomPhoto({})).to.not.exist;
    DirectoryDTO.removeReferences(parent);
    await im.saveToDB(Utils.clone(parent));

    delete p1.metadata.faces;
    delete p1.directory;
    delete p1.id;
    const found: MediaEntity = <any>await gm.getRandomPhoto({});
    delete found.metadata.bitRate;
    delete found.metadata.duration;
    delete found.directory;
    delete found.id;
    expect(Utils.clone(found)).to.be.deep.equal(Utils.clone(p1));
  });

});
