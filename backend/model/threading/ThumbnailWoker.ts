import {Metadata, SharpInstance} from 'sharp';
import {Dimensions, State} from 'gm';
import {Logger} from '../../Logger';
import {ThumbnailProcessingLib} from '../../../common/config/private/IPrivateConfig';

export class ThumbnailWoker {

  private static renderer: (input: RendererInput) => Promise<void> = null;
  private static rendererType = null;

  public static render(input: RendererInput, renderer: ThumbnailProcessingLib): Promise<void> {
    if (ThumbnailWoker.rendererType != renderer) {
      ThumbnailWoker.renderer = RendererFactory.build(renderer);
      ThumbnailWoker.rendererType = renderer;
    }
    return ThumbnailWoker.renderer(input);
  }


}


export interface RendererInput {
  imagePath: string;
  size: number;
  makeSquare: boolean;
  thPath: string;
  qualityPriority: boolean
}

export class RendererFactory {

  public static build(renderer: ThumbnailProcessingLib): (input: RendererInput) => Promise<void> {
    switch (renderer) {
      case ThumbnailProcessingLib.Jimp:
        return RendererFactory.Jimp();
      case ThumbnailProcessingLib.gm:
        return RendererFactory.Gm();
      case ThumbnailProcessingLib.sharp:
        return RendererFactory.Sharp();
    }
    throw 'unknown renderer';
  }

  public static Jimp() {
    const Jimp = require('jimp');
    return async (input: RendererInput): Promise<void> => {
      //generate thumbnail
      Logger.silly('[JimpThRenderer] rendering thumbnail:', input.imagePath);
      const image = await Jimp.read(input.imagePath);
      /**
       * newWidth * newHeight = size*size
       * newHeight/newWidth = height/width
       *
       * newHeight = (height/width)*newWidth
       * newWidth * newWidth = (size*size) / (height/width)
       *
       * @type {number}
       */
      const ratio = image.bitmap.height / image.bitmap.width;
      const algo = input.qualityPriority == true ? Jimp.RESIZE_BEZIER : Jimp.RESIZE_NEAREST_NEIGHBOR;
      if (input.makeSquare == false) {
        let newWidth = Math.sqrt((input.size * input.size) / ratio);

        image.resize(newWidth, Jimp.AUTO, algo);
      } else {
        image.resize(input.size / Math.min(ratio, 1), Jimp.AUTO, algo);
        image.crop(0, 0, input.size, input.size);
      }
      image.quality(60);        // set JPEG quality

      await new Promise((resolve, reject) => {
        image.write(input.thPath, (err) => { // save
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

    };
  }


  public static Sharp() {
    const sharp = require('sharp');
    return async (input: RendererInput): Promise<void> => {

      Logger.silly('[SharpThRenderer] rendering thumbnail:', input.imagePath);
      const image: SharpInstance = sharp(input.imagePath);
      const metadata: Metadata = await image.metadata();

      /**
       * newWidth * newHeight = size*size
       * newHeight/newWidth = height/width
       *
       * newHeight = (height/width)*newWidth
       * newWidth * newWidth = (size*size) / (height/width)
       *
       * @type {number}
       */
      const ratio = metadata.height / metadata.width;
      const kernel = input.qualityPriority == true ? sharp.kernel.lanczos3 : sharp.kernel.nearest;
      if (input.makeSquare == false) {
        const newWidth = Math.round(Math.sqrt((input.size * input.size) / ratio));
        image.resize(newWidth, null, {
          kernel: kernel
        });

      } else {
        image
          .resize(input.size, input.size, {
            kernel: kernel
          })
          .crop(sharp.strategy.center);
      }
      await image.jpeg().toFile(input.thPath);
    };
  }


  public static Gm() {
    const gm = require('gm');
    return (input: RendererInput): Promise<void> => {
      return new Promise((resolve, reject) => {
        Logger.silly('[GMThRenderer] rendering thumbnail:', input.imagePath);
        let image: State = gm(input.imagePath);
        image.size((err, value: Dimensions) => {
          if (err) {
            return reject(err);
          }

          /**
           * newWidth * newHeight = size*size
           * newHeight/newWidth = height/width
           *
           * newHeight = (height/width)*newWidth
           * newWidth * newWidth = (size*size) / (height/width)
           *
           * @type {number}
           */
          try {
            const ratio = value.height / value.width;
            const filter = input.qualityPriority == true ? 'Lanczos' : 'Point';
            image.filter(filter);

            if (input.makeSquare == false) {
              const newWidth = Math.round(Math.sqrt((input.size * input.size) / ratio));
              image = image.resize(newWidth);
            } else {
              image = image.resize(input.size, input.size)
                .crop(input.size, input.size);
            }
            image.write(input.thPath, (err) => {
              if (err) {
                return reject(err);
              }
              return resolve();
            });
          } catch (err) {
            return reject(err);
          }
        });
      });
    };
  }
}
