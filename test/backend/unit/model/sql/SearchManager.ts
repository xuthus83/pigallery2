import {LocationManager} from '../../../../../src/backend/model/database/LocationManager';
import {SearchManager} from '../../../../../src/backend/model/database/sql/SearchManager';
import {SearchResultDTO} from '../../../../../src/common/entities/SearchResultDTO';
import {Utils} from '../../../../../src/common/Utils';
import {DBTestHelper} from '../../../DBTestHelper';
import {
  ANDSearchQuery,
  DistanceSearch,
  FromDateSearch,
  MaxRatingSearch,
  MaxResolutionSearch,
  MinRatingSearch,
  MinResolutionSearch,
  OrientationSearch,
  ORSearchQuery,
  SearchQueryDTO,
  SearchQueryTypes,
  SomeOfSearchQuery,
  TextSearch,
  TextSearchQueryMatchTypes,
  ToDateSearch
} from '../../../../../src/common/entities/SearchQueryDTO';
import {IndexingManager} from '../../../../../src/backend/model/database/sql/IndexingManager';
import {DirectoryDTO} from '../../../../../src/common/entities/DirectoryDTO';
import {TestHelper} from './TestHelper';
import {ObjectManagers} from '../../../../../src/backend/model/ObjectManagers';
import {GalleryManager} from '../../../../../src/backend/model/database/sql/GalleryManager';
import {Connection} from 'typeorm';
import {DirectoryEntity} from '../../../../../src/backend/model/database/sql/enitites/DirectoryEntity';
import {GPSMetadata, PhotoDTO, PhotoMetadata} from '../../../../../src/common/entities/PhotoDTO';
import {VideoDTO} from '../../../../../src/common/entities/VideoDTO';
import {MediaDTO} from '../../../../../src/common/entities/MediaDTO';
import {AutoCompleteItem} from '../../../../../src/common/entities/AutoCompleteItem';
import {Config} from '../../../../../src/common/config/private/Config';

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


class IndexingManagerTest extends IndexingManager {

  public async saveToDB(scannedDirectory: DirectoryDTO): Promise<void> {
    return super.saveToDB(scannedDirectory);
  }
}

class GalleryManagerTest extends GalleryManager {

  public async selectParentDir(connection: Connection, directoryName: string, directoryParent: string): Promise<DirectoryEntity> {
    return super.selectParentDir(connection, directoryName, directoryParent);
  }

  public async fillParentDir(connection: Connection, dir: DirectoryEntity): Promise<void> {
    return super.fillParentDir(connection, dir);
  }
}

describe('SearchManager', (sqlHelper: DBTestHelper) => {
  describe = tmpDescribe;
  let dir: DirectoryDTO;
  /**
   * dir
   * |- v
   * |- p
   * |- p2
   * |-> subDir
   *     |- p_faceLess
   * |-> subDir2
   *     |- p4
   */

  let v: VideoDTO;
  let p: PhotoDTO;
  let p2: PhotoDTO;
  let p_faceLess: PhotoDTO;
  let p4: PhotoDTO;


  const setUpTestGallery = async (): Promise<void> => {
    const directory: DirectoryDTO = TestHelper.getDirectoryEntry();
    const subDir = TestHelper.getDirectoryEntry(directory, 'The Phantom Menace');
    const subDir2 = TestHelper.getDirectoryEntry(directory, 'Return of the Jedi');
    p = TestHelper.getPhotoEntry1(directory);
    p2 = TestHelper.getPhotoEntry2(directory);
    p4 = TestHelper.getPhotoEntry4(subDir2);
    const pFaceLess = TestHelper.getPhotoEntry3(subDir);
    delete pFaceLess.metadata.faces;
    v = TestHelper.getVideoEntry1(directory);

    dir = await DBTestHelper.persistTestDir(directory);
    p = <any>dir.media.filter(m => m.name === p.name)[0];
    p2 = <any>dir.media.filter(m => m.name === p2.name)[0];
    v = <any>dir.media.filter(m => m.name === v.name)[0];
    p4 = <any>dir.directories[1].media[0];
    p_faceLess = <any>dir.directories[0].media[0];
  };

  const setUpSqlDB = async () => {
    await sqlHelper.initDB();
    await setUpTestGallery();
  };


  before(async () => {
    await setUpSqlDB();
  });


  after(async () => {
    await sqlHelper.clearDB();
  });

  it('should get autocomplete', async () => {
    const sm = new SearchManager();

    const cmp = (a: AutoCompleteItem, b: AutoCompleteItem) => {
      if (a.text === b.text) {
        return a.type - b.type;
      }
      return a.text.localeCompare(b.text);
    };

    expect((await sm.autocomplete('tat', SearchQueryTypes.any_text))).to.deep.equalInAnyOrder([
      new AutoCompleteItem('Tatooine', SearchQueryTypes.position)]);
    expect((await sm.autocomplete('star', SearchQueryTypes.any_text))).to.deep.equalInAnyOrder([
      new AutoCompleteItem('star wars', SearchQueryTypes.keyword),
      new AutoCompleteItem('death star', SearchQueryTypes.keyword)]);

    expect((await sm.autocomplete('wars', SearchQueryTypes.any_text))).to.deep.equalInAnyOrder([
      new AutoCompleteItem('star wars', SearchQueryTypes.keyword),
      new AutoCompleteItem('wars dir', SearchQueryTypes.directory)]);

    expect((await sm.autocomplete('arch', SearchQueryTypes.any_text))).eql([
      new AutoCompleteItem('Research City', SearchQueryTypes.position)]);

    Config.Client.Search.AutoComplete.maxItemsPerCategory = 99999;
    expect((await sm.autocomplete('wa', SearchQueryTypes.any_text))).to.deep.equalInAnyOrder([
      new AutoCompleteItem('star wars', SearchQueryTypes.keyword),
      new AutoCompleteItem('Anakin Skywalker', SearchQueryTypes.person),
      new AutoCompleteItem('Luke Skywalker', SearchQueryTypes.person),
      new AutoCompleteItem('wars dir', SearchQueryTypes.directory)]);

    Config.Client.Search.AutoComplete.maxItemsPerCategory = 1;
    expect((await sm.autocomplete('a', SearchQueryTypes.any_text))).to.deep.equalInAnyOrder([
      new AutoCompleteItem('Ajan Kloss', SearchQueryTypes.position),
      new AutoCompleteItem('Amber stone', SearchQueryTypes.caption),
      new AutoCompleteItem('star wars', SearchQueryTypes.keyword),
      new AutoCompleteItem('Anakin Skywalker', SearchQueryTypes.person),
      new AutoCompleteItem('Castilon', SearchQueryTypes.position),
      new AutoCompleteItem('Devaron', SearchQueryTypes.position),
      new AutoCompleteItem('The Phantom Menace', SearchQueryTypes.directory)]);
    Config.Client.Search.AutoComplete.maxItemsPerCategory = 5;

    expect((await sm.autocomplete('sw', SearchQueryTypes.any_text))).to.deep.equalInAnyOrder([
      new AutoCompleteItem('sw1.jpg', SearchQueryTypes.file_name),
      new AutoCompleteItem('sw2.jpg', SearchQueryTypes.file_name),
      new AutoCompleteItem('sw3.jpg', SearchQueryTypes.file_name),
      new AutoCompleteItem('sw4.jpg', SearchQueryTypes.file_name),
      new AutoCompleteItem(v.name, SearchQueryTypes.file_name)]);

    expect((await sm.autocomplete(v.name, SearchQueryTypes.any_text))).to.deep.equalInAnyOrder(
      [new AutoCompleteItem(v.name, SearchQueryTypes.file_name)]);

  });

  const searchifyMedia = (m: MediaDTO): MediaDTO => {
    const tmpM = m.directory.media;
    const tmpD = m.directory.directories;
    const tmpP = m.directory.preview;
    const tmpMT = m.directory.metaFile;
    delete m.directory.directories;
    delete m.directory.media;
    delete m.directory.preview;
    delete m.directory.metaFile;
    const ret = Utils.clone(m);
    if ((ret.metadata as PhotoMetadata).faces && !(ret.metadata as PhotoMetadata).faces.length) {
      delete (ret.metadata as PhotoMetadata).faces;
    }
    m.directory.directories = tmpD;
    m.directory.media = tmpM;
    m.directory.preview = tmpP;
    m.directory.metaFile = tmpMT;
    return ret;
  };

  const removeDir = (result: SearchResultDTO) => {
    result.media = result.media.map(m => searchifyMedia(m));
    return Utils.clone(result);
  };

  describe('advanced search', async () => {

    it('should AND', async () => {
      const sm = new SearchManager();

      let query: SearchQueryDTO = <ANDSearchQuery>{
        type: SearchQueryTypes.AND,
        list: [<TextSearch>{text: p.metadata.faces[0].name, type: SearchQueryTypes.person},
          <TextSearch>{text: p2.metadata.caption, type: SearchQueryTypes.caption}]
      };

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [],
        metaFile: [],
        resultOverflow: false
      }));
      query = <ANDSearchQuery>{
        type: SearchQueryTypes.AND,
        list: [<TextSearch>{text: p.metadata.faces[0].name, type: SearchQueryTypes.person},
          <TextSearch>{text: p.metadata.caption, type: SearchQueryTypes.caption}]
      };
      expect(await sm.search(query)).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p],
        metaFile: [],
        resultOverflow: false
      }));

      // make sure that this shows both photos. We need this the the rest of the tests
      query = <TextSearch>{text: 'a', type: SearchQueryTypes.person};
      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p4],
        metaFile: [],
        resultOverflow: false
      }));

      query = <ANDSearchQuery>{
        type: SearchQueryTypes.AND,
        list: [<ANDSearchQuery>{
          type: SearchQueryTypes.AND,
          list: [<TextSearch>{text: 'a', type: SearchQueryTypes.person},
            <TextSearch>{text: p.metadata.keywords[0], type: SearchQueryTypes.keyword}]
        },
          <TextSearch>{text: p.metadata.caption, type: SearchQueryTypes.caption}
        ]
      };

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p],
        metaFile: [],
        resultOverflow: false
      }));

    });

    it('should OR', async () => {
      const sm = new SearchManager();

      let query: SearchQueryDTO = <ORSearchQuery>{
        type: SearchQueryTypes.OR,
        list: [<TextSearch>{text: 'Not a person', type: SearchQueryTypes.person},
          <TextSearch>{text: 'Not a caption', type: SearchQueryTypes.caption}]
      };

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [],
        metaFile: [],
        resultOverflow: false
      }));
      query = <ORSearchQuery>{
        type: SearchQueryTypes.OR,
        list: [<TextSearch>{text: p.metadata.faces[0].name, type: SearchQueryTypes.person},
          <TextSearch>{text: p2.metadata.caption, type: SearchQueryTypes.caption}]
      };
      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2],
        metaFile: [],
        resultOverflow: false
      }));

      query = <ORSearchQuery>{
        type: SearchQueryTypes.OR,
        list: [<TextSearch>{text: p.metadata.faces[0].name, type: SearchQueryTypes.person},
          <TextSearch>{text: p.metadata.caption, type: SearchQueryTypes.caption}]
      };
      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p],
        metaFile: [],
        resultOverflow: false
      }));

      // make sure that this shows both photos. We need this the the rest of the tests
      query = <TextSearch>{text: 'a', type: SearchQueryTypes.person};
      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p4],
        metaFile: [],
        resultOverflow: false
      }));

      query = <ORSearchQuery>{
        type: SearchQueryTypes.OR,
        list: [<ORSearchQuery>{
          type: SearchQueryTypes.OR,
          list: [<TextSearch>{text: 'a', type: SearchQueryTypes.person},
            <TextSearch>{text: p.metadata.keywords[0], type: SearchQueryTypes.keyword}]
        },
          <TextSearch>{text: p.metadata.caption, type: SearchQueryTypes.caption}
        ]
      };

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p4],
        metaFile: [],
        resultOverflow: false
      }));


      query = <ORSearchQuery>{
        type: SearchQueryTypes.OR,
        list: [<ORSearchQuery>{
          type: SearchQueryTypes.OR,
          list: [<TextSearch>{text: p.metadata.keywords[0], type: SearchQueryTypes.keyword},
            <TextSearch>{text: p2.metadata.keywords[0], type: SearchQueryTypes.keyword}]
        },
          <TextSearch>{text: p_faceLess.metadata.caption, type: SearchQueryTypes.caption}
        ]
      };

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p_faceLess],
        metaFile: [],
        resultOverflow: false
      }));

    });


    it('should minimum of', async () => {
      const sm = new SearchManager();

      let query: SomeOfSearchQuery = <SomeOfSearchQuery>{
        type: SearchQueryTypes.SOME_OF,
        list: [<TextSearch>{text: 'jpg', type: SearchQueryTypes.file_name},
          <TextSearch>{text: 'mp4', type: SearchQueryTypes.file_name}]
      };

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p_faceLess, p4, v],
        metaFile: [],
        resultOverflow: false
      }));

      query = <SomeOfSearchQuery>{
        type: SearchQueryTypes.SOME_OF,
        list: [<TextSearch>{text: 'R2', type: SearchQueryTypes.person},
          <TextSearch>{text: 'Anakin', type: SearchQueryTypes.person},
          <TextSearch>{text: 'Luke', type: SearchQueryTypes.person}]
      };

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p4],
        metaFile: [],
        resultOverflow: false
      }));


      query.min = 2;

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p4],
        metaFile: [],
        resultOverflow: false
      }));

      query.min = 3;

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [],
        metaFile: [],
        resultOverflow: false
      }));

      query = <SomeOfSearchQuery>{
        type: SearchQueryTypes.SOME_OF,
        min: 3,
        list: [<TextSearch>{text: 'sw', type: SearchQueryTypes.file_name},
          <TextSearch>{text: 'R2', type: SearchQueryTypes.person},
          <TextSearch>{text: 'Kamino', type: SearchQueryTypes.position},
          <TextSearch>{text: 'Han', type: SearchQueryTypes.person}]
      };

      expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2],
        metaFile: [],
        resultOverflow: false
      }));

    });

    describe('should search text', async () => {
      it('as any', async () => {
        const sm = new SearchManager();

        let query = <TextSearch>{text: 'sw', type: SearchQueryTypes.any_text};
        expect(Utils.clone(await sm.search(<TextSearch>{text: 'sw', type: SearchQueryTypes.any_text})))
          .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p, p2, p_faceLess, v, p4],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{text: 'sw', negate: true, type: SearchQueryTypes.any_text};

        expect(Utils.clone(await sm.search(query)))
          .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{text: 'Boba', type: SearchQueryTypes.any_text};

        expect(Utils.clone(await sm.search(query)))
          .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{text: 'Boba', negate: true, type: SearchQueryTypes.any_text};
        expect(Utils.clone(await sm.search(query)))
          .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p2, p_faceLess, p4],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{text: 'Boba', negate: true, type: SearchQueryTypes.any_text};
        // all should have faces
        const sRet = await sm.search(query);
        for (let i = 0; i < sRet.media.length; ++i) {
          if (sRet.media[i].id === p_faceLess.id) {
            continue;
          }

          expect((<PhotoDTO>sRet.media[i]).metadata.faces).to.be.not.an('undefined');
          expect((<PhotoDTO>sRet.media[i]).metadata.faces).to.be.lengthOf.above(1);
        }


        query = <TextSearch>{
          text: 'Boba',
          type: SearchQueryTypes.any_text,
          matchType: TextSearchQueryMatchTypes.exact_match
        };
        expect(Utils.clone(await sm.search(query)))
          .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: 'Boba Fett',
          type: SearchQueryTypes.any_text,
          matchType: TextSearchQueryMatchTypes.exact_match
        };

        expect(Utils.clone(await sm.search(query)))
          .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p],
          metaFile: [],
          resultOverflow: false
        }));

      });

      it('as position', async () => {
        const sm = new SearchManager();


        const query = <TextSearch>{text: 'Tatooine', type: SearchQueryTypes.position};
        expect(Utils.clone(await sm.search(query)))
          .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p],
          metaFile: [],
          resultOverflow: false
        }));

      });


      it('as keyword', async () => {
        const sm = new SearchManager();


        let query = <TextSearch>{
          text: 'kie',
          type: SearchQueryTypes.keyword
        };
        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p2, p_faceLess],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: 'wa',
          type: SearchQueryTypes.keyword
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p, p2, p_faceLess, p4],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: 'han',
          type: SearchQueryTypes.keyword
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: 'star wars',
          matchType: TextSearchQueryMatchTypes.exact_match,
          type: SearchQueryTypes.keyword
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p, p2, p_faceLess, p4],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: 'wookiees',
          matchType: TextSearchQueryMatchTypes.exact_match,
          type: SearchQueryTypes.keyword
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p_faceLess],
          metaFile: [],
          resultOverflow: false
        }));

      });


      it('as caption', async () => {
        const sm = new SearchManager();


        const query = <TextSearch>{
          text: 'han',
          type: SearchQueryTypes.caption
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p],
          metaFile: [],
          resultOverflow: false
        }));
      });

      it('as file_name', async () => {
        const sm = new SearchManager();

        let query = <TextSearch>{
          text: 'sw',
          type: SearchQueryTypes.file_name
        };


        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p, p2, p_faceLess, v, p4],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: 'sw4',
          type: SearchQueryTypes.file_name
        };

        expect(Utils.clone(await sm.search(<TextSearch>{
          text: 'sw4',
          type: SearchQueryTypes.file_name
        }))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p4],
          metaFile: [],
          resultOverflow: false
        }));

      });

      it('as directory', async () => {
        const sm = new SearchManager();

        let query = <TextSearch>{
          text: 'of the J',
          type: SearchQueryTypes.directory
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p4],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: 'wars dir',
          type: SearchQueryTypes.directory
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p, p2, v, p_faceLess, p4],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: '/wars dir',
          matchType: TextSearchQueryMatchTypes.exact_match,
          type: SearchQueryTypes.directory
        };


        expect(Utils.clone(await sm.search(<TextSearch>{
          text: '/wars dir',
          matchType: TextSearchQueryMatchTypes.exact_match,
          type: SearchQueryTypes.directory
        }))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p, p2, v],
          metaFile: [],
          resultOverflow: false
        }));


        query = <TextSearch>{
          text: '/wars dir/Return of the Jedi',
          matchType: TextSearchQueryMatchTypes.exact_match,
          type: SearchQueryTypes.directory
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p4],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: '/wars dir/Return of the Jedi',
          matchType: TextSearchQueryMatchTypes.exact_match,
          type: SearchQueryTypes.directory
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p4],
          metaFile: [],
          resultOverflow: false
        }));


      });

      it('as person', async () => {
        const sm = new SearchManager();

        let query = <TextSearch>{
          text: 'Boba',
          type: SearchQueryTypes.person
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: 'Boba',
          type: SearchQueryTypes.person,
          matchType: TextSearchQueryMatchTypes.exact_match
        };

        expect(Utils.clone(await sm.search(query))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [],
          metaFile: [],
          resultOverflow: false
        }));

        query = <TextSearch>{
          text: 'Boba Fett',
          type: SearchQueryTypes.person,
          matchType: TextSearchQueryMatchTypes.exact_match
        };

        expect(Utils.clone(await sm.search(<TextSearch>{
          text: 'Boba Fett',
          type: SearchQueryTypes.person,
          matchType: TextSearchQueryMatchTypes.exact_match
        }))).to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
          searchQuery: query,
          directories: [],
          media: [p],
          metaFile: [],
          resultOverflow: false
        }));

      });

    });


    it('should search date', async () => {
      const sm = new SearchManager();

      let query: any = <ToDateSearch>{value: 0, type: SearchQueryTypes.to_date};

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [],
        metaFile: [],
        resultOverflow: false
      }));

      query = <FromDateSearch>{
        value: p.metadata.creationDate, type: SearchQueryTypes.from_date
      };

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, v],
        metaFile: [],
        resultOverflow: false
      }));

      query = <FromDateSearch>{
        value: p.metadata.creationDate,
        negate: true,
        type: SearchQueryTypes.from_date
      };

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p2, p_faceLess, p4],
        metaFile: [],
        resultOverflow: false
      }));

      query = <ToDateSearch>{
        value: p.metadata.creationDate + 1000000000,
        type: SearchQueryTypes.to_date
      };

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p_faceLess, v, p4],
        metaFile: [],
        resultOverflow: false
      }));

    });


    it('should search rating', async () => {
      const sm = new SearchManager();

      let query: MinRatingSearch | MaxRatingSearch = <MaxRatingSearch>{value: 0, type: SearchQueryTypes.max_rating};


      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [],
        metaFile: [],
        resultOverflow: false
      }));

      query = <MaxRatingSearch>{value: 5, type: SearchQueryTypes.max_rating};
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p_faceLess],
        metaFile: [],
        resultOverflow: false
      }));

      query = <MaxRatingSearch>{value: 5, negate: true, type: SearchQueryTypes.max_rating};
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [],
        metaFile: [],
        resultOverflow: false
      }));

      query = <MinRatingSearch>{value: 2, type: SearchQueryTypes.min_rating};
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p2, p_faceLess],
        metaFile: [],
        resultOverflow: false
      }));

      query = <MinRatingSearch>{value: 2, negate: true, type: SearchQueryTypes.min_rating};
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p],
        metaFile: [],
        resultOverflow: false
      }));
    });


    it('should search resolution', async () => {
      const sm = new SearchManager();

      let query: MinResolutionSearch | MaxResolutionSearch =
        <MaxResolutionSearch>{value: 0, type: SearchQueryTypes.max_resolution};

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [],
        metaFile: [],
        resultOverflow: false
      }));

      query = <MaxResolutionSearch>{value: 1, type: SearchQueryTypes.max_resolution};
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, v],
        metaFile: [],
        resultOverflow: false
      }));

      query = <MinResolutionSearch>{value: 3, type: SearchQueryTypes.min_resolution};
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p4],
        metaFile: [],
        resultOverflow: false
      }));


      query = <MinResolutionSearch>{value: 3, negate: true, type: SearchQueryTypes.min_resolution};
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p_faceLess, v],
        metaFile: [],
        resultOverflow: false
      }));

      query = <MaxResolutionSearch>{value: 3, negate: true, type: SearchQueryTypes.max_resolution};
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p4],
        metaFile: [],
        resultOverflow: false
      }));

    });


    it('should search orientation', async () => {
      const sm = new SearchManager();

      let query = <OrientationSearch>{
        landscape: false,
        type: SearchQueryTypes.orientation
      };
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2, p4, v],
        metaFile: [],
        resultOverflow: false
      }));

      query = <OrientationSearch>{
        landscape: true,
        type: SearchQueryTypes.orientation
      };
      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p_faceLess, v],
        metaFile: [],
        resultOverflow: false
      }));


    });

    it('should search distance', async () => {
      ObjectManagers.getInstance().LocationManager = new LocationManager();
      const sm = new SearchManager();

      ObjectManagers.getInstance().LocationManager.getGPSData = async (): Promise<GPSMetadata> => {
        return {
          longitude: 10,
          latitude: 10,
          altitude: 0
        };
      };

      let query = <DistanceSearch>{
        from: {text: 'Tatooine'},
        distance: 1,
        type: SearchQueryTypes.distance
      };

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p],
        metaFile: [],
        resultOverflow: false
      }));

      query = <DistanceSearch>{
        from: {GPSData: {latitude: 0, longitude: 0}},
        distance: 112 * 10, // number of km per degree = ~111km
        type: SearchQueryTypes.distance
      };

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p2],
        metaFile: [],
        resultOverflow: false
      }));

      query = <DistanceSearch>{
        from: {GPSData: {latitude: 0, longitude: 0}},
        distance: 112 * 10, // number of km per degree = ~111km
        negate: true,
        type: SearchQueryTypes.distance
      };

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p_faceLess, p4],
        metaFile: [],
        resultOverflow: false
      }));
      query = <DistanceSearch>{
        from: {GPSData: {latitude: 10, longitude: 10}},
        distance: 1,
        type: SearchQueryTypes.distance
      };

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p],
        metaFile: [],
        resultOverflow: false
      }));

      query = <DistanceSearch>{
        from: {GPSData: {latitude: 10, longitude: 10}},
        distance: 112 * 5, // number of km per degree = ~111km
        type: SearchQueryTypes.distance
      };

      expect(Utils.clone(await sm.search(query)))
        .to.deep.equalInAnyOrder(removeDir(<SearchResultDTO>{
        searchQuery: query,
        directories: [],
        media: [p, p_faceLess, p4],
        metaFile: [],
        resultOverflow: false
      }));

    });

  });


  it('should get random photo', async () => {
    const sm = new SearchManager();

    let query = <TextSearch>{
      text: 'xyz',
      type: SearchQueryTypes.keyword
    };

    // tslint:disable-next-line
    expect(await sm.getRandomPhoto(query)).to.not.exist;

    query = <TextSearch>{
      text: 'wookiees',
      matchType: TextSearchQueryMatchTypes.exact_match,
      type: SearchQueryTypes.keyword
    };
    expect(Utils.clone(await sm.getRandomPhoto(query))).to.deep.equalInAnyOrder(searchifyMedia(p_faceLess));
  });

});
