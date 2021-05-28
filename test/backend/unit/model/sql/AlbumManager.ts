import {DBTestHelper} from '../../../DBTestHelper';
import {DirectoryDTO} from '../../../../../src/common/entities/DirectoryDTO';
import {TestHelper} from './TestHelper';
import {ObjectManagers} from '../../../../../src/backend/model/ObjectManagers';
import {PhotoDTO, PhotoMetadata} from '../../../../../src/common/entities/PhotoDTO';
import {VideoDTO} from '../../../../../src/common/entities/VideoDTO';
import {AlbumManager} from '../../../../../src/backend/model/database/sql/AlbumManager';
import {SearchQueryTypes, TextSearch} from '../../../../../src/common/entities/SearchQueryDTO';
import {SQLConnection} from '../../../../../src/backend/model/database/sql/SQLConnection';
import {AlbumBaseEntity} from '../../../../../src/backend/model/database/sql/enitites/album/AlbumBaseEntity';
import {Utils} from '../../../../../src/common/Utils';
import {MediaDTO} from '../../../../../src/common/entities/MediaDTO';


const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');

chai.use(deepEqualInAnyOrder);
const {expect} = chai;

// to help WebStorm to handle the test cases
declare let describe: any;
declare const after: any;
declare const before: any;
const tmpDescribe = describe;
describe = DBTestHelper.describe(); // fake it os IDE plays nicely (recognize the test)


describe('AlbumManager', (sqlHelper: DBTestHelper) => {
  describe = tmpDescribe;
  /**
   * dir
   * |- v
   * |- p
   * |- p2
   * |-> subDir
   *     |- p3
   * |-> subDir2
   *     |- p4
   */

  let dir: DirectoryDTO;
  let subDir: DirectoryDTO;
  let subDir2: DirectoryDTO;
  let v: VideoDTO;
  let p: PhotoDTO;
  let p2: PhotoDTO;
  let p3: PhotoDTO;
  let p4: PhotoDTO;


  const setUpTestGallery = async (): Promise<void> => {
    const directory: DirectoryDTO = TestHelper.getDirectoryEntry();
    subDir = TestHelper.getDirectoryEntry(directory, 'The Phantom Menace');
    subDir2 = TestHelper.getDirectoryEntry(directory, 'Return of the Jedi');
    p = TestHelper.getRandomizedPhotoEntry(directory, 'Photo1');
    p2 = TestHelper.getRandomizedPhotoEntry(directory, 'Photo2');
    p3 = TestHelper.getRandomizedPhotoEntry(subDir, 'Photo3');
    p4 = TestHelper.getRandomizedPhotoEntry(subDir2, 'Photo4');
    v = TestHelper.getVideoEntry1(directory);

    dir = await DBTestHelper.persistTestDir(directory);
    subDir = dir.directories[0];
    subDir2 = dir.directories[1];
    p = (dir.media.filter(m => m.name === p.name)[0] as any);
    p2 = (dir.media.filter(m => m.name === p2.name)[0] as any);
    v = (dir.media.filter(m => m.name === v.name)[0] as any);
    p3 = (dir.directories[0].media[0] as any);
    p4 = (dir.directories[1].media[0] as any);
  };

  const setUpSqlDB = async () => {
    await sqlHelper.initDB();
    await setUpTestGallery();
    await ObjectManagers.InitSQLManagers();
  };


  const toAlbumPreview = (m: MediaDTO): MediaDTO => {
    const tmpM = m.directory.media;
    const tmpD = m.directory.directories;
    const tmpP = m.directory.preview;
    const tmpMT = m.directory.metaFile;
    delete m.directory.directories;
    delete m.directory.media;
    delete m.directory.preview;
    delete m.directory.metaFile;
    const ret = Utils.clone(m);
    delete (ret.metadata as PhotoMetadata).faces;
    m.directory.directories = tmpD;
    m.directory.media = tmpM;
    m.directory.preview = tmpP;
    m.directory.metaFile = tmpMT;
    return ret;
  };


  before(setUpSqlDB);
  after(sqlHelper.clearDB);

  describe('Saved search', () => {


    beforeEach(setUpSqlDB);
    afterEach(sqlHelper.clearDB);

    it('should add album', async () => {
      const am = new AlbumManager();
      const connection = await SQLConnection.getConnection();

      const query: TextSearch = {text: 'test', type: SearchQueryTypes.any_text};

      expect(await connection.getRepository(AlbumBaseEntity).find()).to.deep.equalInAnyOrder([]);

      await am.addSavedSearch('Test Album', Utils.clone(query));

      expect(await connection.getRepository(AlbumBaseEntity).find()).to.deep.equalInAnyOrder([{
        id: 1,
        name: 'Test Album',
        searchQuery: query
      }]);
    });

    it('should delete album', async () => {
      const am = new AlbumManager();
      const connection = await SQLConnection.getConnection();

      const query: TextSearch = {text: 'test', type: SearchQueryTypes.any_text};


      await am.addSavedSearch('Test Album', Utils.clone(query));
      await am.addSavedSearch('Test Album2', Utils.clone(query));

      expect(await connection.getRepository(AlbumBaseEntity).find()).to.deep.equalInAnyOrder([
        {
          id: 1,
          name: 'Test Album',
          searchQuery: query
        },
        {
          id: 2,
          name: 'Test Album2',
          searchQuery: query
        }]);

      await am.deleteAlbum(1);
      expect(await connection.getRepository(AlbumBaseEntity).find()).to.deep.equalInAnyOrder([{
        id: 2,
        name: 'Test Album2',
        searchQuery: query
      }]);

      await am.deleteAlbum(2);
      expect(await connection.getRepository(AlbumBaseEntity).find()).to.deep.equalInAnyOrder([]);
    });
  });

  it('should list album', async () => {
    const am = new AlbumManager();

    const query: TextSearch = {text: 'photo1', type: SearchQueryTypes.any_text};

    await am.addSavedSearch('Test Album', Utils.clone(query));

    expect(await am.getAlbums()).to.deep.equalInAnyOrder(([{
      id: 1,
      name: 'Test Album',
      searchQuery: query,
      preview: toAlbumPreview(p)
    }]));


  });


});
