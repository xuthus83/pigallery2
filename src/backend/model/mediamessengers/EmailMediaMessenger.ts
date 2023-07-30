import {createTransport, Transporter} from 'nodemailer';
import {MediaDTO} from '../../../common/entities/MediaDTO';
import {Config} from '../../../common/config/private/Config';
import {EmailMessagingType} from '../../../common/config/private/MessagingConfig';

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

  public async sendMedia(mailSettings: {
    from: string,
    to: string,
    subject: string,
    text: string
  }, media: MediaDTO[]) {

    return await this.transporter.sendMail({
      from: mailSettings.from,
      to: mailSettings.to,
      subject: mailSettings.subject,
      text: mailSettings.text + media.map(m => m.name).join(', ')
    });
  }
}
