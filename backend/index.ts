import * as cluster from "cluster";
import {Worker} from "./model/threading/Worker";
import {Server} from "./server";


if (cluster.isMaster) {
  new Server();
} else {
  Worker.process();
}
