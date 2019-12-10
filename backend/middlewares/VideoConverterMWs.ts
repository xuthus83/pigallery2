import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import {ITaskExecuter, TaskExecuter} from '../model/threading/TaskExecuter';
import {VideoConverterInput, VideoConverterWorker} from '../model/threading/VideoConverterWorker';
import {MetadataLoader} from '../model/threading/MetadataLoader';
import {Config} from '../../common/config/private/Config';
import {ProjectPath} from '../ProjectPath';

const existPr = util.promisify(fs.exists);

export class VideoConverterMWs {
  private static taskQue: ITaskExecuter<VideoConverterInput, void> =
    new TaskExecuter(1, (input => VideoConverterWorker.convert(input)));


  public static generateConvertedFileName(videoPath: string): string {
    const extension = path.extname(videoPath);
    const file = path.basename(videoPath, extension);
    const postfix = Math.round(Config.Server.Video.transcoding.bitRate / 1024) + 'k' +
      Config.Server.Video.transcoding.codec.toString().toLowerCase() +
      Config.Server.Video.transcoding.resolution;
    return path.join(ProjectPath.TranscendedFolder,
      ProjectPath.getRelativePathToImages(path.dirname(videoPath)), file +
      '_' + postfix + '.' + Config.Server.Video.transcoding.format);
  }

  public static async convertVideo(videoPath: string): Promise<void> {


    const outPath = this.generateConvertedFileName(videoPath);

    if (await existPr(outPath)) {
      return;
    }
    const metaData = await MetadataLoader.loadVideoMetadata(videoPath);

    const renderInput: VideoConverterInput = {
      videoPath: videoPath,
      output: {
        path: outPath,
        codec: Config.Server.Video.transcoding.codec,
        format: Config.Server.Video.transcoding.format
      }
    };

    if (metaData.bitRate > Config.Server.Video.transcoding.bitRate) {
      renderInput.output.bitRate = Config.Server.Video.transcoding.bitRate;
    }
    if (metaData.fps > Config.Server.Video.transcoding.fps) {
      renderInput.output.fps = Config.Server.Video.transcoding.fps;
    }

    if (Config.Server.Video.transcoding.resolution < metaData.size.height) {
      renderInput.output.resolution = Config.Server.Video.transcoding.resolution;
    }

    const outDir = path.dirname(renderInput.output.path);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, {recursive: true});
    }

    await VideoConverterMWs.taskQue.execute(renderInput);

  }
}

