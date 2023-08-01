import {createTransport, Transporter} from 'nodemailer';
import {MediaDTO, MediaDTOUtils} from '../../../common/entities/MediaDTO';
import {Config} from '../../../common/config/private/Config';
import {EmailMessagingType} from '../../../common/config/private/MessagingConfig';
import {PhotoProcessing} from '../fileprocessing/PhotoProcessing';
import {ThumbnailSourceType} from '../threading/PhotoWorker';
import {ProjectPath} from '../../ProjectPath';
import * as path from 'path';
import {PhotoMetadata} from '../../../common/entities/PhotoDTO';
import {Utils} from '../../../common/Utils';

export class EmailMediaMessenger {
  transporter: Transporter;

  constructor() {
    if (Config.Messaging.Email.type === EmailMessagingType.sendmail) {
      this.transporter = createTransport({
        sendmail: true
      });
    } else {
      this.transporter = createTransport({
        host: Config.Messaging.Email.smtp.host,
        port: Config.Messaging.Email.smtp.port,
        secure: Config.Messaging.Email.smtp.secure,
        requireTLS: Config.Messaging.Email.smtp.requireTLS,
        auth: {
          user: Config.Messaging.Email.smtp.user,
          pass: Config.Messaging.Email.smtp.password
        }
      });
    }

  }

  private async getThumbnail(m: MediaDTO) {
    return await PhotoProcessing.generateThumbnail(
      path.join(ProjectPath.ImageFolder, m.directory.path, m.directory.name, m.name),
      Config.Media.Thumbnail.thumbnailSizes[0],
      MediaDTOUtils.isPhoto(m) ? ThumbnailSourceType.Photo : ThumbnailSourceType.Video,
      false
    );
  }

  public async sendMedia(mailSettings: {
    to: string,
    subject: string,
    text: string
  }, media: MediaDTO[]) {

    const attachments = [];
    const htmlStart = '<h1 style="text-align: center; margin-bottom: 2em">' + Config.Server.applicationTitle + '</h1>\n' +
      '<h3>' + mailSettings.text + '</h3>\n' +
      '<table style="margin-left: auto;  margin-right: auto;">\n' +
      '  <tbody>\n';
    const htmlEnd = '  </tr>\n' +
      '  </tbody>\n' +
      '</table>';
    let htmlMiddle = '';
    for (let i = 0; i < media.length; ++i) {
      const thPath = await this.getThumbnail(media[i]);
      const linkUrl = Utils.concatUrls(Config.Server.publicUrl, '/gallery/', path.join(media[i].directory.path, media[i].directory.name));
      const location = (media[i].metadata as PhotoMetadata).positionData?.country ?
        (media[i].metadata as PhotoMetadata).positionData?.country :
        ((media[i].metadata as PhotoMetadata).positionData?.city ?
          (media[i].metadata as PhotoMetadata).positionData?.city : '');
      const caption = (new Date(media[i].metadata.creationDate)).getFullYear() + (location ? ', ' + location : '');
      attachments.push({
        filename: media[i].name,
        path: thPath,
        cid: 'img' + i
      });
      if (i % 2 == 0) {
        htmlMiddle += '<tr>';
      }
      htmlMiddle += '<td>\n' +
        '      <a style="display: block;text-align: center;" href="' + linkUrl + '"><img alt="' + media[i].name + '" style="max-width: 200px; height: 150px" src="cid:img' + i + '"/></a>\n' +
        caption +
        '    </td>\n';

      if (i % 2 == 1 || i === media.length - 1) {
        htmlMiddle += '</tr>';
      }
    }

    return await this.transporter.sendMail({
      from: Config.Messaging.Email.emailFrom,
      to: mailSettings.to,
      subject: mailSettings.subject,
      html: htmlStart + htmlMiddle + htmlEnd,
      attachments: attachments
    });
  }
}
