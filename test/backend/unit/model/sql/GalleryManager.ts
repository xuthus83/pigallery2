import {expect} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import {Config} from '../../../../../common/config/private/Config';
import {DatabaseType, ReIndexingSensitivity} from '../../../../../common/config/private/IPrivateConfig';
import {SQLConnection} from '../../../../../backend/model/sql/SQLConnection';
import {GalleryManager} from '../../../../../backend/model/sql/GalleryManager';
import {DirectoryDTO} from '../../../../../common/entities/DirectoryDTO';
import {TestHelper} from './TestHelper';
import {Connection} from 'typeorm';
import {DirectoryEntity} from '../../../../../backend/model/sql/enitites/DirectoryEntity';
import {Utils} from '../../../../../common/Utils';
import {MediaDTO} from '../../../../../common/entities/MediaDTO';


class GalleryManagerTest extends GalleryManager {


  public async selectParentDir(connection: Connection, directoryName: string, directoryParent: string): Promise<DirectoryEntity> {
    return super.selectParentDir(connection, directoryName, directoryParent);
  }

  public async fillParentDir(connection: Connection, dir: DirectoryEntity): Promise<void> {
    return super.fillParentDir(connection, dir);
  }

  public async saveToDB(scannedDirectory: DirectoryDTO) {
    return super.saveToDB(scannedDirectory);
  }
}

describe('GalleryManager', () => {


  const tempDir = path.join(__dirname, '../../tmp');
  const dbPath = path.join(tempDir, 'test.db');


  const setUpSqlDB = async () => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    Config.Server.database.type = DatabaseType.sqlite;
    Config.Server.database.sqlite.storage = dbPath;

  };

  const tearDownSqlDB = async () => {
    await SQLConnection.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }
  };

  beforeEach(async () => {
    await setUpSqlDB();
  });

  afterEach(async () => {
    await tearDownSqlDB();
  });

  const removeIds = (dir: DirectoryDTO) => {
    delete dir.id;
    dir.media.forEach((media: MediaDTO) => {
      delete media.id;

    });

    if (dir.directories) {
      dir.directories.forEach((directory: DirectoryDTO) => {
        removeIds(directory);
      });
    }
  };

  it('should save parent directory', async () => {
    const gm = new GalleryManagerTest();

    const parent = TestHelper.getRandomizedDirectoryEntry();
    const p1 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo1');
    const p2 = TestHelper.getRandomizedPhotoEntry(parent, 'Photo2');
    const subDir = TestHelper.getRandomizedDirectoryEntry(parent, 'subDir');
    const sp1 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto1');
    const sp2 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto2');


    DirectoryDTO.removeReferences(parent);
    await gm.saveToDB(Utils.clone(parent));

    const conn = await SQLConnection.getConnection();
    const selected = await gm.selectParentDir(conn, parent.name, parent.path);
    await gm.fillParentDir(conn, selected);

    DirectoryDTO.removeReferences(selected);
    removeIds(selected);
    subDir.isPartial = true;
    delete subDir.directories;
    expect(selected).to.deep.equal(parent);

  });


  it('should update sub directory', async () => {
    const gm = new GalleryManagerTest();

    const parent = TestHelper.getRandomizedDirectoryEntry();
    parent.name = 'parent';
    const p1 = TestHelper.getRandomizedPhotoEntry(parent);
    const subDir = TestHelper.getRandomizedDirectoryEntry(parent, 'subDir');
    subDir.name = 'subDir';
    const sp1 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto1');

    DirectoryDTO.removeReferences(parent);
    await gm.saveToDB(Utils.clone(parent));

    const sp2 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto2');
    const sp3 = TestHelper.getRandomizedPhotoEntry(subDir, 'subPhoto3');

    DirectoryDTO.removeReferences(subDir);
    await gm.saveToDB(Utils.clone(subDir));

    const conn = await SQLConnection.getConnection();
    const selected = await gm.selectParentDir(conn, subDir.name, subDir.path);
    await gm.fillParentDir(conn, selected);

    // subDir.isPartial = true;
    //  delete subDir.directories;
    DirectoryDTO.removeReferences(selected);
    delete subDir.parent;
    removeIds(selected);
    // selected.directories[0].parent = selected;
    expect(selected).to.deep.equal(subDir);

  });

});
