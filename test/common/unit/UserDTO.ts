import {expect} from 'chai';
import {UserDTO} from '../../../common/entities/UserDTO';

describe('UserDTO', () => {


  it('should check available path', () => {
    expect(UserDTO.isPathAvailable('/', ['/'])).to.be.equals(true);
    expect(UserDTO.isPathAvailable('/', ['/subfolder', '/'])).to.be.equals(true);
    expect(UserDTO.isPathAvailable('/abc', ['/subfolder', '/'])).to.be.equals(false);
    expect(UserDTO.isPathAvailable('/abc', ['/subfolder', '/*'])).to.be.equals(true);
    expect(UserDTO.isPathAvailable('/abc', ['/subfolder'])).to.be.equals(false);
    expect(UserDTO.isPathAvailable('/abc/two', ['/subfolder'])).to.be.equals(false);
    expect(UserDTO.isPathAvailable('/abc/two', ['/'])).to.be.equals(false);
    expect(UserDTO.isPathAvailable('/abc/two', ['/*'])).to.be.equals(true);
  });

  it('should check directory', () => {
    expect(UserDTO.isDirectoryAvailable(<any>{path: '/', name: 'abc'}, ['/*'])).to.be.equals(true);
    expect(UserDTO.isDirectoryAvailable(<any>{path: '/', name: 'abc'}, ['/'])).to.be.equals(false);
    expect(UserDTO.isDirectoryAvailable(<any>{path: '.\\', name: '.'}, ['/'])).to.be.equals(true);
    expect(UserDTO.isDirectoryAvailable(<any>{path: '/', name: 'abc'}, ['/*', '/asdad'])).to.be.equals(true);
  });


});
