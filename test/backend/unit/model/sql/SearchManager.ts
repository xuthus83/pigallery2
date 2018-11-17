import {expect} from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import {Config} from '../../../../../common/config/private/Config';
import {DatabaseType} from '../../../../../common/config/private/IPrivateConfig';
import {SQLConnection} from '../../../../../backend/model/sql/SQLConnection';
import {
  CameraMetadataEntity,
  GPSMetadataEntity,
  PhotoEntity,
  PhotoMetadataEntity,
  PositionMetaDataEntity
} from '../../../../../backend/model/sql/enitites/PhotoEntity';
import {SearchManager} from '../../../../../backend/model/sql/SearchManager';
import {AutoCompleteItem, SearchTypes} from '../../../../../common/entities/AutoCompleteItem';
import {SearchResultDTO} from '../../../../../common/entities/SearchResultDTO';
import {DirectoryEntity} from '../../../../../backend/model/sql/enitites/DirectoryEntity';
import {MediaDimensionEntity} from '../../../../../backend/model/sql/enitites/MediaEntity';

describe('SearchManager', () => {


  const tempDir = path.join(__dirname, '../../tmp');
  const dbPath = path.join(tempDir, 'test.db');

  const dir = new DirectoryEntity();
  dir.name = 'wars dir';
  dir.path = '.';
  dir.lastModified = Date.now();
  dir.lastScanned = null;

  const getPhoto = () => {
    const sd = new MediaDimensionEntity();
    sd.height = 200;
    sd.width = 200;
    const gps = new GPSMetadataEntity();
    /* gps.altitude = 1;
     gps.latitude = 1;
     gps.longitude = 1;*/
    const pd = new PositionMetaDataEntity();
    /* pd.city = "New York";
     pd.country = "Alderan";
     pd.state = "Death star";*/
    pd.GPSData = gps;
    const cd = new CameraMetadataEntity();
    /* cd.ISO = 100;
     cd.model = "60D";
     cd.maker = "Canon";
     cd.fStop = 1;
     cd.exposure = 1;
     cd.focalLength = 1;*/
    cd.lens = 'Lens';
    const m = new PhotoMetadataEntity();
    m.keywords = ['apple'];
    m.cameraData = cd;
    m.positionData = pd;
    m.size = sd;
    m.creationDate = Date.now();
    m.fileSize = 123456789;


    const d = new PhotoEntity();
    d.name = 'test media.jpg';
    d.directory = dir;
    d.metadata = m;
    return d;
  };

  const p = getPhoto();
  p.metadata.keywords = ['Boba Fett', 'star wars', 'Anakin', 'death star'];
  p.metadata.positionData.city = 'Mos Eisley';
  p.metadata.positionData.country = 'Tatooine';
  p.name = 'sw1';

  const p2 = getPhoto();
  p2.metadata.keywords = ['Padmé Amidala', 'star wars', 'Natalie Portman', 'death star'];
  p2.metadata.positionData.city = 'Derem City';
  p2.metadata.positionData.state = 'Research City';
  p2.metadata.positionData.country = 'Kamino';
  p2.name = 'sw2';

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

    const pr = conn.getRepository(PhotoEntity);

    await conn.getRepository(DirectoryEntity).save(p.directory);
    await pr.save(p);
    await pr.save(p2);

    await SQLConnection.close();
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


  it('should get autocomplete', async () => {
    const sm = new SearchManager();

    const cmp = (a: AutoCompleteItem, b: AutoCompleteItem) => {
      return a.text.localeCompare(b.text);
    };

    expect((await sm.autocomplete('tat'))).to.deep.equal([new AutoCompleteItem('Tatooine', SearchTypes.position)]);
    expect((await sm.autocomplete('star'))).to.deep.equal([new AutoCompleteItem('star wars', SearchTypes.keyword),
      new AutoCompleteItem('death star', SearchTypes.keyword)]);

    expect((await sm.autocomplete('wars'))).to.deep.equal([new AutoCompleteItem('star wars', SearchTypes.keyword),
      new AutoCompleteItem('wars dir', SearchTypes.directory)]);

    expect((await sm.autocomplete('arch'))).eql([new AutoCompleteItem('Research City', SearchTypes.position)]);
    expect((await sm.autocomplete('a')).sort(cmp)).eql([
      new AutoCompleteItem('Boba Fett', SearchTypes.keyword),
      new AutoCompleteItem('star wars', SearchTypes.keyword),
      new AutoCompleteItem('Anakin', SearchTypes.keyword),
      new AutoCompleteItem('death star', SearchTypes.keyword),
      new AutoCompleteItem('Padmé Amidala', SearchTypes.keyword),
      new AutoCompleteItem('Natalie Portman', SearchTypes.keyword),
      new AutoCompleteItem('Kamino', SearchTypes.position),
      new AutoCompleteItem('Tatooine', SearchTypes.position),
      new AutoCompleteItem('wars dir', SearchTypes.directory),
      new AutoCompleteItem('Research City', SearchTypes.position)].sort(cmp));

    expect((await sm.autocomplete('sw')).sort(cmp)).to.deep.equal([new AutoCompleteItem('sw1', SearchTypes.image),
      new AutoCompleteItem('sw2', SearchTypes.image)].sort(cmp));
  });


  it('should search', async () => {
    const sm = new SearchManager();

    expect((await sm.search('sw', null))).to.deep.equal(<SearchResultDTO>{
      searchText: 'sw',
      searchType: null,
      directories: [],
      media: [p, p2],
      resultOverflow: false
    });

    expect((await sm.search('Tatooine', SearchTypes.position))).to.deep.equal(<SearchResultDTO>{
      searchText: 'Tatooine',
      searchType: SearchTypes.position,
      directories: [],
      media: [p],
      resultOverflow: false
    });

    expect((await sm.search('ortm', SearchTypes.keyword))).to.deep.equal(<SearchResultDTO>{
      searchText: 'ortm',
      searchType: SearchTypes.keyword,
      directories: [],
      media: [p2],
      resultOverflow: false
    });

    expect((await sm.search('ortm', SearchTypes.keyword))).to.deep.equal(<SearchResultDTO>{
      searchText: 'ortm',
      searchType: SearchTypes.keyword,
      directories: [],
      media: [p2],
      resultOverflow: false
    });

    expect((await sm.search('wa', SearchTypes.keyword))).to.deep.equal(<SearchResultDTO>{
      searchText: 'wa',
      searchType: SearchTypes.keyword,
      directories: [dir],
      media: [p, p2],
      resultOverflow: false
    });
  });


  it('should instant search', async () => {
    const sm = new SearchManager();

    expect((await sm.instantSearch('sw'))).to.deep.equal({
      searchText: 'sw',
      directories: [],
      photos: [p, p2],
      resultOverflow: false
    });

    expect((await sm.instantSearch('Tatooine'))).to.deep.equal({
      searchText: 'Tatooine',
      directories: [],
      photos: [p],
      resultOverflow: false
    });

    expect((await sm.instantSearch('ortm'))).to.deep.equal({
      searchText: 'ortm',
      directories: [],
      photos: [p2],
      resultOverflow: false
    });

    expect((await sm.instantSearch('ortm'))).to.deep.equal({
      searchText: 'ortm',
      directories: [],
      photos: [p2],
      resultOverflow: false
    });

    expect((await sm.instantSearch('wa'))).to.deep.equal({
      searchText: 'wa',
      directories: [dir],
      photos: [p, p2],
      resultOverflow: false
    });
  });


});
