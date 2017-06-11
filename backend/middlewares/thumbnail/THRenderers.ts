import {Metadata, SharpInstance} from "@types/sharp";
import {Dimensions, State} from "@types/gm";

export module ThumbnailRenderers {

  export interface RendererInput {
    imagePath: string;
    size: number;
    makeSquare: boolean;
    thPath: string;
    qualityPriority: boolean,
    __dirname: string;
  }

  export const jimp = (input: RendererInput, done) => {

    //generate thumbnail
    const Jimp = require("jimp");
    Jimp.read(input.imagePath).then((image) => {

      const Logger = require(input.__dirname + "/../../Logger").Logger;
      Logger.silly("[JimpThRenderer] rendering thumbnail:", input.imagePath);
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
      image.write(input.thPath, () => { // save
        return done();
      });
    }).catch(function (err) {
      const Error = require(input.__dirname + "/../../../common/entities/Error").Error;
      const ErrorCodes = require(input.__dirname + "/../../../common/entities/Error").ErrorCodes;
      return done(new Error(ErrorCodes.GENERAL_ERROR, err));
    });
  };

  export const sharp = (input: RendererInput, done) => {

    //generate thumbnail
    const sharp = require("sharp");

    const image: SharpInstance = sharp(input.imagePath);
    image
      .metadata()
      .then((metadata: Metadata) => {

        const Logger = require(input.__dirname + "/../../Logger").Logger;
        Logger.silly("[SharpThRenderer] rendering thumbnail:", input.imagePath);
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
          const ratio = metadata.height / metadata.width;
          const kernel = input.qualityPriority == true ? sharp.kernel.lanczos3 : sharp.kernel.nearest;
          const interpolator = input.qualityPriority == true ? sharp.interpolator.bicubic : sharp.interpolator.nearest;
          if (input.makeSquare == false) {
            const newWidth = Math.round(Math.sqrt((input.size * input.size) / ratio));
            image.resize(newWidth, null, {
              kernel: kernel,
              interpolator: interpolator
            });

          } else {
            image
              .resize(input.size, input.size, {
                kernel: kernel,
                interpolator: interpolator
              })
              .crop(sharp.strategy.center);
          }
          image
            .jpeg()
            .toFile(input.thPath).then(() => {
            return done();
          }).catch(function (err) {
            const Error = require(input.__dirname + "/../../../common/entities/Error").Error;
            const ErrorCodes = require(input.__dirname + "/../../../common/entities/Error").ErrorCodes;
            return done(new Error(ErrorCodes.GENERAL_ERROR, err));
          });
        } catch (err) {
          const Error = require(input.__dirname + "/../../../common/entities/Error").Error;
          const ErrorCodes = require(input.__dirname + "/../../../common/entities/Error").ErrorCodes;
          return done(new Error(ErrorCodes.GENERAL_ERROR, err));
        }
      });

  };


  export const gm = (input: RendererInput, done) => {

    //generate thumbnail
    const gm = require("gm");

    let image: State = gm(input.imagePath);
    image
      .size((err, value: Dimensions) => {
        if (err) {
          const Error = require(input.__dirname + "/../../../common/entities/Error").Error;
          const ErrorCodes = require(input.__dirname + "/../../../common/entities/Error").ErrorCodes;
          return done(new Error(ErrorCodes.GENERAL_ERROR, err));
        }
        const Logger = require(input.__dirname + "/../../Logger").Logger;
        Logger.silly("[GMThRenderer] rendering thumbnail:", input.imagePath);


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

              const Error = require(input.__dirname + "/../../../common/entities/Error").Error;
              const ErrorCodes = require(input.__dirname + "/../../../common/entities/Error").ErrorCodes;
              return done(new Error(ErrorCodes.GENERAL_ERROR, err));
            }
            return done();
          });
        } catch (err) {
          const Error = require(input.__dirname + "/../../../common/entities/Error").Error;
          const ErrorCodes = require(input.__dirname + "/../../../common/entities/Error").ErrorCodes;
          return done(new Error(ErrorCodes.GENERAL_ERROR, err));
        }

      });


  };
}
