import {Logger} from '../../Logger';
import * as fs from 'fs';
import * as util from 'util';
import {FfmpegCommand} from 'fluent-ffmpeg';
import {FFmpegFactory} from '../FFmpegFactory';
import {ServerConfig} from '../../../common/config/private/IPrivateConfig';

const renamePr = util.promisify(fs.rename);

export interface VideoConverterInput {
  videoPath: string;
  output: {
    path: string,
    bitRate?: number,
    resolution?: ServerConfig.resolutionType,
    fps?: number,
    codec: ServerConfig.codecType,
    format: ServerConfig.formatType
  };
}

export class VideoConverterWorker {

  private static ffmpeg = FFmpegFactory.get();

  public static async convert(input: VideoConverterInput): Promise<void> {
    const origPath = input.output.path;
    input.output.path = origPath + '.part';
    await this._convert(input);
    await renamePr(input.output.path, origPath);

  }

  private static _convert(input: VideoConverterInput): Promise<void> {

    if (this.ffmpeg == null) {
      this.ffmpeg = FFmpegFactory.get();
    }

    return new Promise((resolve, reject) => {

      Logger.silly('[FFmpeg] transcoding video: ' + input.videoPath);


      const command: FfmpegCommand = this.ffmpeg(input.videoPath);
      let executedCmd = '';
      command
        .on('start', (cmd: string) => {
          Logger.silly('[FFmpeg] running:' + cmd);
          executedCmd = cmd;
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (e: any) => {
          reject('[FFmpeg] ' + e.toString() + ' executed: ' + executedCmd);
        });
      // set video bitrate
      if (input.output.bitRate) {
        command.videoBitrate((input.output.bitRate / 1024) + 'k');
      }
      // set target codec
      command.videoCodec(input.output.codec);
      if (input.output.resolution) {
        command.size('?x' + input.output.resolution);
      }

      // set fps
      if (input.output.fps) {
        command.fps(input.output.fps);
      }
      // set output format to force
      command.format(input.output.format)
        // save to file
        .save(input.output.path);

    });
  }

}

