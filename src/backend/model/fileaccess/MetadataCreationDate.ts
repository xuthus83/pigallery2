//The elements are [tagname1, tag-name1, description]
//tagname1 is typically a full date time, but in some cases tagname1 and tagname2 together make up a full timestamp


const metadataTags: [string, string, string][] = [
  // EXIF tags
  ["exif.DateTimeOriginal", "exif.OffsetTimeOriginal", "Date and time when the original image was taken"],
  ["exif.CreateDate", "exif.OffsetTime", "Date and time when the image was created"],
  ["xmp:CreateDate", "", "Date and time when the image was created (XMP standard)"],
  ["exif.DateTimeDigitized", "exif.OffsetTimeDigitized", "Date and time when the image was digitized"],
  ["iptc.DateCreated", "iptc.TimeCreated", "Date and time when the image was created (IPTC standard)"],
  ["ihdr.Creation Time", "", "PNG Creation Time"],
  
  // TIFF tags
  ["TIFF.DateTime", "", "Date and time when the image was created (TIFF standard)"],
  
  // QuickTime tags
  ["quicktime.CreationDate", "", "Date and time when the QuickTime movie was created"],
  ["quicktime.CreateDate", "", "Date and time when the QuickTime movie was created in UTC"],

  //Photoshop tags
  ["photoshop.DateCreated", "", "Date and time when the image was created"],
  
  // AVI tags
  ["AVI.CreationTime", "", "Date and time when the AVI video was created"],
  
  // MP4 tags
  ["MP4.CreationTime", "", "Date and time when the MP4 video was created"],
  ["MP4.ModifyDate", "", "Date and time when the MP4 video was last modified"],
  
  // WebP tags
  ["WebP.VP8X/Time", "", "Date and time when the WebP image was created"],
  
  
  // HEIC tags
  ["heic.ContentCreateDate", "", "Date and time when the HEIC image content was created"],
  ["heic.CreationDate", "", "Date and time when the HEIC image was created"],
  
  // RAW image format tags
  ["cr2.DateTimeOriginal", "", "Date and time when the original Canon RAW image was taken"],
  ["nef.DateTimeOriginal", "", "Date and time when the original Nikon RAW image was taken"],
  ["dng.DateTimeOriginal", "", "Date and time when the original DNG image was taken"],
  ["rw2.DateTimeOriginal", "", "Date and time when the original Panasonic RAW image was taken"],
  ["arw.DateTimeOriginal", "", "Date and time when the original Sony Alpha RAW image was taken"],
  ["cr3.DateTimeOriginal", "", "Date and time when the original Canon RAW image was taken"],
  ["sr2.DateTimeOriginal", "", "Date and time when the original Sony RAW image was taken"],
  ["orf.DateTimeOriginal", "", "Date and time when the original Olympus RAW image was taken"],
  
  ["ifd0.ModifyDate", "", "Modificaton date from the idf0 section"],
  ["xmp:ModifyDate", "", "Date and time when the image was last modified (XMP standard)"]

];