import {expect} from "chai";
import * as fs from "fs";
import * as path from "path";
import {Config} from "../../../../../common/config/private/Config";
import {DatabaseType} from "../../../../../common/config/private/IPrivateConfig";
import {SQLConnection} from "../../../../../backend/model/sql/SQLConnection";
import {SharingManager} from "../../../../../backend/model/sql/SharingManager";
import {SharingDTO} from "../../../../../common/entities/SharingDTO";
import {UserEntity} from "../../../../../backend/model/sql/enitites/UserEntity";
import {UserDTO, UserRoles} from "../../../../../common/entities/UserDTO";

describe('SharingManager', () => {


  const tempDir = path.join(__dirname, "../../tmp");
  const dbPath = path.join(tempDir, "test.db");

  let creator: UserDTO = null;

  const setUpSqlDB = async () => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    Config.Server.database.type = DatabaseType.sqlite;
    Config.Server.database.sqlite.storage = dbPath;

    const conn = await SQLConnection.getConnection();

    creator = await conn.getRepository(UserEntity).save({
      id: null,
      name: "test use",
      password: "",
      role: UserRoles.User,
      permissions: null
    });

    await SQLConnection.close();
  };

  const teardownUpSqlDB = async () => {
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
    await teardownUpSqlDB();
  });


  it('should create sharing', async () => {
    let sm = new SharingManager();

    let sharing: SharingDTO = {
      id: null,
      sharingKey: "testKey",
      path: "/",
      password: null,
      creator: creator,
      expires: Date.now() + 1000,
      includeSubfolders: true,
      timeStamp: Date.now()
    };

    const saved = await sm.createSharing(sharing);
    expect(saved.id).to.not.equals(null);
    expect(saved.creator.id).to.equals(creator.id);
    expect(saved.sharingKey).to.equals(sharing.sharingKey);
    expect(saved.timeStamp).to.equals(sharing.timeStamp);
    expect(saved.password).to.equals(sharing.password);
    expect(saved.expires).to.equals(sharing.expires);
    expect(saved.includeSubfolders).to.equals(sharing.includeSubfolders);
  });


  it('should find sharing', async () => {
    let sm = new SharingManager();

    let sharing: SharingDTO = {
      id: null,
      sharingKey: "testKey",
      path: "/",
      password: null,
      creator: creator,
      expires: Date.now() + 1000,
      includeSubfolders: true,
      timeStamp: Date.now()
    };

    const saved = await sm.createSharing(sharing);
    const found = await sm.findOne({sharingKey: "testKey"});

    expect(found.id).to.not.equals(null);
    expect(found.sharingKey).to.equals(sharing.sharingKey);
    expect(found.timeStamp).to.equals(sharing.timeStamp);
    expect(found.password).to.equals(sharing.password);
    expect(found.expires).to.equals(sharing.expires);
  });


  it('should update sharing', async () => {
    let sm = new SharingManager();

    let sharing: SharingDTO = {
      id: null,
      sharingKey: "testKey",
      path: "/",
      password: null,
      creator: creator,
      expires: Date.now() + 1000,
      includeSubfolders: true,
      timeStamp: Date.now()
    };

    const saved = await sm.createSharing(sharing);
    expect(saved.password).to.equals(sharing.password);
    expect(saved.expires).to.equals(sharing.expires);
    expect(saved.includeSubfolders).to.equals(sharing.includeSubfolders);

    let update: SharingDTO = {
      id: saved.id,
      sharingKey: saved.sharingKey,
      path: saved.path,
      password: null,
      creator: creator,
      expires: Date.now() + 2000,
      includeSubfolders: false,
      timeStamp: Date.now()
    };
    const updated = await sm.updateSharing(update);

    expect(updated.id).to.equals(saved.id);
    expect(updated.sharingKey).to.equals(sharing.sharingKey);
    expect(updated.timeStamp).to.equals(sharing.timeStamp);
    expect(updated.password).to.equals(update.password);
    expect(updated.expires).to.equals(update.expires);
    expect(updated.includeSubfolders).to.equals(update.includeSubfolders);
  });

});
