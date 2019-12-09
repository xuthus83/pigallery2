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
    'ogg',
    'avi'
  ],
  MetaFiles: [
    'gpx'
  ],
  WithDots: {
    Photos: <string[]>[],
    Videos: <string[]>[],
    MetaFiles: <string[]>[],
  }
};

SupportedFormats.WithDots.Photos = SupportedFormats.Photos.map(f => '.' + f);
SupportedFormats.WithDots.Videos = SupportedFormats.Videos.map(f => '.' + f);
SupportedFormats.WithDots.MetaFiles = SupportedFormats.MetaFiles.map(f => '.' + f);

