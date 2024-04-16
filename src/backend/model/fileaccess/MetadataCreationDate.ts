//The elements are [tagname1, tag-name1]
//tagname1 is typically a full date time, but in some cases tagname1 and tagname2 together make up a full timestamp

//Interesting exiftool forums posts about some of these tags:
//exif.DateTimeOriginal, exif.CreateDate/exif.DateTimeDigitized and exif.ModifyDate: https://exiftool.org/forum/index.php?topic=13170.msg71174#msg71174 
//https://exiftool.org/forum/index.php?topic=15555.msg83536#msg83536

const DateTags: [string, string][] = [
  // Date tag                 Offset or time tag            //Description
  ["exif.DateTimeOriginal",   "exif.OffsetTimeOriginal"],   //Date and time when the original image was taken - shutter close time
  ["exif.CreateDate",         "exif.OffsetTimeDigitized"],  //Date and time when the image was created
  ["exif.DateTimeDigitized",  "exif.OffsetTimeDigitized"],  //Same as exif.CreateDate but older and newer spec name
  ["ifd0.ModifyDate",         ""],                          //The date and time of image creation. In Exif standard, it is the date and time the file was changed.
  ["ihdr.Creation Time",      ""],                          //Time of original image creation for PNG files
  ["photoshop.DateCreated",   ""],                          //The date the intellectual content of the document was created. Used and set by LightRoom among others
  ["xmp:CreateDate",          ""],                          //Date and time when the image was created (XMP standard)
  ["iptc.DateCreated",        "iptc.TimeCreated"],          //Designates the date and optionally the time the content of the image was created rather than the date of the creation of the digital representation
  ["quicktime.CreationDate",  ""],                          //Date and time when the QuickTime movie was created"],
  ["quicktime.CreateDate",    ""],                          //Date and time when the QuickTime movie was created in UTC"],
  ["heic.ContentCreateDate",  ""],                          //Date and time when the HEIC image content was created"],
  ["heic.CreationDate",       ""],                          //Date and time when the HEIC image was created"],
  ["tiff.DateTime",           ""],                          //Date and time of image creation. This property is stored in XMP as xmp:ModifyDate.
  ["xmp:ModifyDate",          "exif.OffsetTime"],           //Date and time when the image was last modified (XMP standard)"]
  ["xmp.MetadataDate",        ""],                          //The date and time that any metadata for this resource was last changed. It should be the same as or more recent than xmp:ModifyDate.
];
