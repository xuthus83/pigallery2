import {expect} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import {Config} from '../../../../../common/config/private/Config';
import {DatabaseType} from '../../../../../common/config/private/IPrivateConfig';
import {SQLConnection} from '../../../../../backend/model/sql/SQLConnection';
import {UserEntity} from '../../../../../backend/model/sql/enitites/UserEntity';
import {UserRoles} from '../../../../../common/entities/UserDTO';
import {PasswordHelper} from '../../../../../backend/model/PasswordHelper';
import {DirectoryEntity} from '../../../../../backend/model/sql/enitites/DirectoryEntity';
import {
  CameraMetadataEntity,
  GPSMetadataEntity,
  ImageSizeEntity,
  PhotoEntity,
  PhotoMetadataEntity,
  PositionMetaDataEntity
} from '../../../../../backend/model/sql/enitites/PhotoEntity';

describe('Typeorm integration', () => {


  const tempDir = path.join(__dirname, '../../tmp');
  const dbPath = path.join(tempDir, 'test.db');
  const setUpSqlDB = () => {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    Config.Server.database.type = DatabaseType.sqlite;
    Config.Server.database.sqlite.storage = dbPath;

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

  beforeEach(() => {
    setUpSqlDB();
  });

  afterEach(async () => {
    await teardownUpSqlDB();
  });


  const getDir = () => {
    const d = new DirectoryEntity();
    d.name = 'test dir';
    d.path = '.';
    d.lastModified = Date.now();
    d.lastScanned = null;
    d.parent = null;
    d.photos = [];
    d.directories = [];
    return d;
  };


  const getPhoto = () => {
    const sd = new ImageSizeEntity();
    sd.height = 200;
    sd.width = 200;
    const gps = new GPSMetadataEntity();
    gps.altitude = 1;
    gps.latitude = 1;
    gps.longitude = 1;
    const pd = new PositionMetaDataEntity();
    pd.city = 'New York';
    pd.country = 'Alderan';
    pd.state = 'Death star';
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


    const d = new PhotoEntity();
    d.name = 'test photo.jpg';
    d.directory = null;
    d.metadata = m;
    return d;
  };

  it('should open and close connection', async () => {
    const conn = await SQLConnection.getConnection();
    expect(conn.isConnected).to.equal(true);
    await SQLConnection.close();
    expect(conn.isConnected).to.equal(false);
  });

  it('should open and close connection twice', async () => {
    let conn = await SQLConnection.getConnection();
    expect(conn.isConnected).to.equal(true);
    await SQLConnection.close();
    expect(conn.isConnected).to.equal(false);

    conn = await SQLConnection.getConnection();
    expect(conn.isConnected).to.equal(true);
    await SQLConnection.close();
    expect(conn.isConnected).to.equal(false);
  });

  it('should add a user', async () => {
    const conn = await SQLConnection.getConnection();
    const userRepository = conn.getRepository(UserEntity);
    const a = new UserEntity();
    a.name = 'test';
    a.password = PasswordHelper.cryptPassword('test');
    a.role = UserRoles.Admin;
    await userRepository.save(a);
    expect((await userRepository.find()).length).to.equal(1);
  });


  it('should add a dir', async () => {
    const conn = await SQLConnection.getConnection();
    const dr = conn.getRepository(DirectoryEntity);
    await dr.save(getDir());
    expect((await dr.find()).length).to.equal(1);
  });

  it('should add a photo', async () => {
    const conn = await SQLConnection.getConnection();
    const pr = conn.getRepository(PhotoEntity);
    const dir = await conn.getRepository(DirectoryEntity).save(getDir());
    let photo = getPhoto();
    photo.directory = dir;
    await pr.save(photo);
    expect((await pr.find()).length).to.equal(1);
  });

  it('should find a photo', async () => {
    const conn = await SQLConnection.getConnection();
    const pr = conn.getRepository(PhotoEntity);
    const dir = await conn.getRepository(DirectoryEntity).save(getDir());
    let photo = getPhoto();
    photo.directory = dir;
    await pr.save(photo);

    let photos = await pr
      .createQueryBuilder('photo')
      .orderBy('photo.metadata.creationDate', 'ASC')
      .where('photo.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + photo.metadata.positionData.city + '%'})
      .innerJoinAndSelect('photo.directory', 'directory')
      .limit(10)
      .getMany();

    expect(photos.length).to.equal(1);
    expect(photos[0].directory.name).to.equal(dir.name);
  });


  it('should not find a photo', async () => {
    const conn = await SQLConnection.getConnection();
    const pr = conn.getRepository(PhotoEntity);
    const dir = await conn.getRepository(DirectoryEntity).save(getDir());
    let photo = getPhoto();
    photo.directory = dir;
    const city = photo.metadata.positionData.city;
    photo.metadata.positionData = null;
    await pr.save(photo);
    let photos = await pr
      .createQueryBuilder('photo')
      .orderBy('photo.metadata.creationDate', 'ASC')
      .where('photo.metadata.positionData.city LIKE :text COLLATE utf8_general_ci', {text: '%' + city + '%'})
      .innerJoinAndSelect('photo.directory', 'directory')
      .limit(10)
      .getMany();

    expect(photos.length).to.equal(0);
  });

  it('should open and close connection twice with photo added ', async () => {
    let conn = await SQLConnection.getConnection();
    const dir = await conn.getRepository(DirectoryEntity).save(getDir());
    let dir2 = getDir();
    dir2.parent = dir;
    await conn.getRepository(DirectoryEntity).save(dir2);
    let photo = getPhoto();
    photo.directory = dir2;
    await await conn.getRepository(PhotoEntity).save(photo);
    await SQLConnection.close();
    expect(conn.isConnected).to.equal(false);

    conn = await SQLConnection.getConnection();
    expect(conn.isConnected).to.equal(true);
    await SQLConnection.close();
    expect(conn.isConnected).to.equal(false);
  });

});
