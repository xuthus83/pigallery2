import * as FfmpegCommand from 'fluent-ffmpeg';


const run = async () => {

  const command = FfmpegCommand('demo/images/fulbright_mediumbr.mp4');
  // command.setFfmpegPath('ffmpeg/ffmpeg.exe');
  // command.setFfprobePath('ffmpeg/ffprobe.exe');
  // command.setFlvtoolPath('ffmpeg/ffplay.exe');
  FfmpegCommand('demo/images/fulbright_mediumbr.mp4').ffprobe((err,data) => {
    console.log(data);
  });
  command // setup event handlers
    .on('filenames', function (filenames) {
      console.log('screenshots are ' + filenames.join(', '));
    })
    .on('end', function () {
      console.log('screenshots were saved');
    })
    .on('error', function (err) {
      console.log('an error happened: ' + err.message);
    })
    .outputOptions(['-qscale:v 4'])
    // take 2 screenshots at predefined timemarks and size
    .takeScreenshots({timemarks: ['10%'], size: '450x?', filename: 'thumbnail2-at-%s-seconds.jpg'});
};

run();
