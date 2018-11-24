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
import {OrientationTypes} from 'ts-exif-parser';
import {Utils} from '../../../../../common/Utils';
import {TestHelper} from './TestHelper';
import {afterEach, beforeEach, describe, it} from '@angular/core/testing/src/testing_internal';

describe('SearchManager', () => {


  const tempDir = path.join(__dirname, '../../tmp');
  const dbPath = path.join(tempDir, 'test.db');

  const dir = TestHelper.getDirectoryEntry();
  const p = TestHelper.getPhotoEntry1(dir);
  const p2 = TestHelper.getPhotoEntry2(dir);

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


    expect(Utils.clone(await sm.search('sw', null))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'sw',
      searchType: null,
      directories: [],
      media: [p, p2],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('Tatooine', SearchTypes.position))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'Tatooine',
      searchType: SearchTypes.position,
      directories: [],
      media: [p],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('ortm', SearchTypes.keyword))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'ortm',
      searchType: SearchTypes.keyword,
      directories: [],
      media: [p2],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('ortm', SearchTypes.keyword))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'ortm',
      searchType: SearchTypes.keyword,
      directories: [],
      media: [p2],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.search('wa', SearchTypes.keyword))).to.deep.equal(Utils.clone(<SearchResultDTO>{
      searchText: 'wa',
      searchType: SearchTypes.keyword,
      directories: [dir],
      media: [p, p2],
      resultOverflow: false
    }));
  });


  it('should instant search', async () => {
    const sm = new SearchManager();

    expect(Utils.clone(await sm.instantSearch('sw'))).to.deep.equal(Utils.clone({
      searchText: 'sw',
      directories: [],
      media: [p, p2],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.instantSearch('Tatooine'))).to.deep.equal(Utils.clone({
      searchText: 'Tatooine',
      directories: [],
      media: [p],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.instantSearch('ortm'))).to.deep.equal(Utils.clone({
      searchText: 'ortm',
      directories: [],
      media: [p2],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.instantSearch('ortm'))).to.deep.equal(Utils.clone({
      searchText: 'ortm',
      directories: [],
      media: [p2],
      resultOverflow: false
    }));

    expect(Utils.clone(await sm.instantSearch('wa'))).to.deep.equal(Utils.clone({
      searchText: 'wa',
      directories: [dir],
      media: [p, p2],
      resultOverflow: false
    }));
  });


});
