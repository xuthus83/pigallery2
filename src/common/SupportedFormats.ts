export const SupportedFormats = {
  Photos: [
    'gif',
    'jpeg', 'jpg', 'jpe',
    'png',
    'webp',
    'svg'
  ],
  Videos: [
    'mp4',
    'webm',
    'ogv',
    'ogg'
  ],
  MetaFiles: [
    'gpx'
  ],
  TranscodeNeed: {
    Photos: <string[]>[],
    Videos: [
      'avi',
      'mkv',
      'mov',
      'wmv',
      'flv'
    ],
  },
  WithDots: {
    Photos: <string[]>[],
    Videos: <string[]>[],
    MetaFiles: <string[]>[],
    TranscodeNeed: {
      Photos: <string[]>[],
      Videos: <string[]>[],
    }
  }
};

SupportedFormats.Photos = SupportedFormats.Photos.concat(SupportedFormats.TranscodeNeed.Photos);
SupportedFormats.Videos = SupportedFormats.Videos.concat(SupportedFormats.TranscodeNeed.Videos);
SupportedFormats.WithDots.Photos = SupportedFormats.Photos.map(f => '.' + f);
SupportedFormats.WithDots.Videos = SupportedFormats.Videos.map(f => '.' + f);
SupportedFormats.WithDots.MetaFiles = SupportedFormats.MetaFiles.map(f => '.' + f);
SupportedFormats.WithDots.TranscodeNeed.Photos = SupportedFormats.TranscodeNeed.Photos.map(f => '.' + f);
SupportedFormats.WithDots.TranscodeNeed.Videos = SupportedFormats.TranscodeNeed.Videos.map(f => '.' + f);

