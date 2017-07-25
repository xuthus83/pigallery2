import * as cluster from "cluster";

if (cluster.isMaster) {
  const Server = require("./server").Server;
  new Server();
} else {
  const Worker = require("./model/threading/Worker").Worker;
  Worker.process();
}
