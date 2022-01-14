import {DBTestHelper} from '../../../DBTestHelper';
import {GalleryManager} from '../../../../../src/backend/model/database/sql/GalleryManager';
import {ObjectManagers} from '../../../../../src/backend/model/ObjectManagers';
import {SQLConnection} from '../../../../../src/backend/model/database/sql/SQLConnection';
import {DirectoryEntity} from '../../../../../src/backend/model/database/sql/enitites/DirectoryEntity';
import {ParentDirectoryDTO} from '../../../../../src/common/entities/DirectoryDTO';
import {Connection} from 'typeorm';

const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');

chai.use(deepEqualInAnyOrder);
const {expect} = chai;

// to help WebStorm to handle the test cases
declare let describe: any;
declare const before: any;
declare const after: any;
const tmpDescribe = describe;
describe = DBTestHelper.describe();


class GalleryManagerTest extends GalleryManager {


  public async selectParentDir(connection: Connection, directoryName: string, directoryParent: string): Promise<ParentDirectoryDTO> {
    return super.selectParentDir(connection, directoryName, directoryParent);
  }

  public async fillParentDir(connection: Connection, dir: ParentDirectoryDTO): Promise<void> {
    return super.fillParentDir(connection, dir);
  }

}

describe('GalleryManager', (sqlHelper: DBTestHelper) => {
  describe = tmpDescribe;


  const setUpSqlDB = async () => {
    await sqlHelper.initDB();
    await sqlHelper.setUpTestGallery();
    await ObjectManagers.InitSQLManagers();
  };

  before(setUpSqlDB);
  after(sqlHelper.clearDB);

  it('should invalidate and update preview', async () => {
    const gm = new GalleryManagerTest();
    const conn = await SQLConnection.getConnection();

    const selectDir = async () => {
      return await conn.getRepository(DirectoryEntity).findOne({id: sqlHelper.testGalleyEntities.subDir.id}, {
        join: {
          alias: 'dir',
          leftJoinAndSelect: {preview: 'dir.preview'}
        }
      });
    };


    let subdir = await selectDir();

    expect(subdir.validPreview).to.equal(true);
    expect(subdir.preview.id).to.equal(1);

    // new version should invalidate
    await gm.onNewDataVersion(sqlHelper.testGalleyEntities.subDir as ParentDirectoryDTO);
    subdir = await selectDir();
    expect(subdir.validPreview).to.equal(false);
    // during invalidation, we do not remove the previous preview (it's good to show at least some photo)
    expect(subdir.preview.id).to.equal(1);

    await conn.createQueryBuilder()
      .update(DirectoryEntity)
      .set({validPreview: false, preview: null}).execute();
    expect((await selectDir()).preview).to.equal(null);

    const res = await gm.selectParentDir(conn, sqlHelper.testGalleyEntities.dir.name, sqlHelper.testGalleyEntities.dir.path);
    await gm.fillParentDir(conn, res);
    subdir = await selectDir();
    expect(subdir.validPreview).to.equal(true);
    expect(subdir.preview.id).to.equal(1);

  });

});
