///<reference path="exif.d.ts"/>
import * as path from "path";
import {DirectoryDTO} from "../../common/entities/DirectoryDTO";
import {ProjectPath} from "../ProjectPath";
import {Logger} from "../Logger";
import {diskManagerTask, DiskManagerTask} from "./DiskMangerTask";
import {Config} from "../../common/config/private/Config";

const Pool = require('threads').Pool;
const pool = new Pool(1);

const LOG_TAG = "[DiskManager]";


pool.run(diskManagerTask);

export class DiskManager {
  public static scanDirectory(relativeDirectoryName: string): Promise<DirectoryDTO> {
    return new Promise((resolve, reject) => {
      Logger.silly(LOG_TAG, "scanning directory:", relativeDirectoryName);
      let directoryName = path.basename(relativeDirectoryName);
      let directoryParent = path.join(path.dirname(relativeDirectoryName), path.sep);
      let absoluteDirectoryName = path.join(ProjectPath.ImageFolder, relativeDirectoryName);

      let input = <DiskManagerTask.PoolInput>{
        relativeDirectoryName,
        directoryName,
        directoryParent,
        absoluteDirectoryName
      };

      let done = (error: any, result: DirectoryDTO) => {
        if (error || !result) {
          return reject(error);
        }

        let addDirs = (dir: DirectoryDTO) => {
          dir.photos.forEach((ph) => {
            ph.directory = dir;
          });
          dir.directories.forEach((d) => {
            addDirs(d);
          });
        };
        addDirs(result);
        return resolve(result);
      };

      let error = (error) => {
        return reject(error);
      };


      if (Config.Server.enableThreading == true) {
        pool.send(input).on('done', done).on('error', error);
      } else {
        try {
          diskManagerTask(input, done);
        } catch (err) {
          error(err);
        }
      }
    });
  }

}
