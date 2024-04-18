//The elements are [tag-name1, tag-name2, type of tag-name2]
//tagname1 is typically a full date time, but in some cases tagname1 and tagname2 together make up a full timestamp

//Interesting exiftool forums posts about some of these tags:
//exif.DateTimeOriginal, exif.CreateDate/exif.DateTimeDigitized and exif.ModifyDate: https://exiftool.org/forum/index.php?topic=13170.msg71174#msg71174 
//https://exiftool.org/forum/index.php?topic=15555.msg83536#msg83536

export const DateTags: [string, string, string][] = [
  // Date tag                 Offset or time tag          Type  //Description
  ["exif.DateTimeOriginal",   "exif.OffsetTimeOriginal",  'O'], //Date and time when the original image was taken - shutter close time
  ["exif.CreateDate",         "exif.OffsetTimeDigitized", 'O'], //Date and time when the image was created
  ["exif.DateTimeDigitized",  "exif.OffsetTimeDigitized", 'O'], //Same as exif.CreateDate but older and newer spec name
  ["ifd0.ModifyDate",         undefined, undefined],            //The date and time of image creation. In Exif standard, it is the date and time the file was changed.
  ["ihdr.Creation Time",      undefined, undefined],            //Time of original image creation for PNG files
  ["photoshop.DateCreated",   undefined, undefined],            //The date the intellectual content of the document was created. Used and set by LightRoom among others
  ["xmp.CreateDate",          undefined, undefined],            //Date and time when the image was created (XMP standard)
  ["iptc.DateCreated",        "iptc.TimeCreated",         'T'], //Designates the date and optionally the time the content of the image was created rather than the date of the creation of the digital representation
  ["quicktime.CreationDate",  undefined, undefined],            //Date and time when the QuickTime movie was created"],
  ["quicktime.CreateDate",    undefined, undefined],            //Date and time when the QuickTime movie was created in UTC"],
  ["heic.ContentCreateDate",  undefined, undefined],            //Date and time when the HEIC image content was created"],
  ["heic.CreationDate",       undefined, undefined],            //Date and time when the HEIC image was created"],
  ["tiff.DateTime",           undefined, undefined],            //Date and time of image creation.
  ["exif.ModifyDate",         "exif.OffsetTime",          'O'], //Modification date
  ["xmp.ModifyDate",          undefined, undefined],            //Date and time when the image was last modified (XMP standard)"]
  ["xmp.MetadataDate",        undefined, undefined],            //The date and time that any metadata for this resource was last changed. It should be the same as or more recent than xmp:ModifyDate.
];
