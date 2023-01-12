import * as cluster from 'cluster';
import {Server} from './server';
import {Worker} from './model/threading/Worker';
import {ConfigDiagnostics} from './model/diagnostics/ConfigDiagnostics';


if ((process.argv || []).includes('--run-diagnostics')) {
  console.log('Running diagnostics and exiting.');
  ConfigDiagnostics.runDiagnostics().catch((e) => {
    console.error(e);
    process.exit(1);
  }).then(() => {
    process.exit(0);
  });
} else {
  if ((cluster as any).isMaster) {
    new Server();
  } else {
    Worker.process();
  }
}
