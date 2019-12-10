import * as cluster from 'cluster';

if (cluster.isMaster) {
  const Server = require('./server').Server;
  const srv = new Server();
} else {
  const Worker = require('./model/threading/Worker').Worker;
  Worker.process();
}
