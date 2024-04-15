import {expect} from 'chai';
import { ConfigClassBuilder } from 'typeconfig/node';
import {ExtensionConfigWrapper} from '../../../../src/backend/model/extension/ExtensionConfigWrapper';


describe('Config', () => {
  it('should load default from env', () => {
    process.env['default-Media-tempFolder'] = 'test/test'
    const conf = ExtensionConfigWrapper.originalSync();
    console.log(ConfigClassBuilder.attachPrivateInterface(conf.Media).__defaults);
    expect(ConfigClassBuilder.attachPrivateInterface(conf.Media).__defaults.tempFolder).to.be.equal('test/test');
    expect(process.env['default-Media-tempFolder']).to.be.equal('test/test');
    const conf2 = ExtensionConfigWrapper.originalSync();
    expect(ConfigClassBuilder.attachPrivateInterface(conf2.Media).__defaults.tempFolder).to.be.equal('test/test');
  });
});
