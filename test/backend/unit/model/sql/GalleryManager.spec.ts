import {DBTestHelper} from '../../../DBTestHelper';
import {GalleryManager} from '../../../../../src/backend/model/database/GalleryManager';
import {ParentDirectoryDTO} from '../../../../../src/common/entities/DirectoryDTO';
import {Connection} from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepEqualInAnyOrder = require('deep-equal-in-any-order');
// eslint-disable-next-line @typescript-eslint/no-var-requires
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

  public async getDirIdAndTime(connection: Connection, directoryName: string, directoryParent: string) {
    return super.getDirIdAndTime(connection, directoryName, directoryParent);
  }

  public async getParentDirFromId(connection: Connection, dir: number): Promise<ParentDirectoryDTO> {
    return super.getParentDirFromId(connection, dir);
  }
}

describe('GalleryManager', (sqlHelper: DBTestHelper) => {
  describe = tmpDescribe;

});
