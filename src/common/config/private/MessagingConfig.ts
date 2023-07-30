/* eslint-disable @typescript-eslint/no-inferrable-types */
import {SubConfigClass} from '../../../../node_modules/typeconfig/src/decorators/class/SubConfigClass';
import {ConfigPriority, TAGS} from '../public/ClientConfig';
import {ConfigProperty} from '../../../../node_modules/typeconfig/src/decorators/property/ConfigPropoerty';
import {ServerConfig} from './PrivateConfig';

export enum EmailMessagingType {
  sendmail = 1,
  SMTP = 2,
}

@SubConfigClass<TAGS>({softReadonly: true})
export class EmailSMTPMessagingConfig {
  @ConfigProperty({
    tags: {
      name: $localize`Host`,
      priority: ConfigPriority.advanced,
      hint: 'smtp.example.com'
    },
    description: $localize`SMTP host server`
  })
  host: string = '';

  @ConfigProperty({
    tags: {
      name: $localize`Port`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`SMTP server's port`
  })
  port: number = 587;

  @ConfigProperty({
    tags: {
      name: $localize`isSecure`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`Is the connection secure. See https://nodemailer.com/smtp/#tls-options for more details`
  })
  secure: boolean = false;

  @ConfigProperty({
    tags: {
      name: $localize`TLS required`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`if this is true and secure is false then Nodemailer (used library in the background) tries to use STARTTLS. See https://nodemailer.com/smtp/#tls-options for more details`
  })
  requireTLS: boolean = true;


  @ConfigProperty({
    tags: {
      name: $localize`User`,
      priority: ConfigPriority.advanced,
    },
    description: $localize`User to connect to the SMTP server.`
  })
  user: string = '';


  @ConfigProperty({
    tags: {
      name: $localize`Password`,
      priority: ConfigPriority.advanced,
    },
    type: 'password',
    description: $localize`Password to connect to the SMTP server.`
  })
  password: string = '';

}

@SubConfigClass<TAGS>({softReadonly: true})
export class EmailMessagingConfig {
  @ConfigProperty<EmailMessagingType, EmailMessagingConfig>({
    type: EmailMessagingType,
    tags:
      {
        name: $localize`Sending method`,
        priority: ConfigPriority.advanced,
        uiDisabled: (sc: EmailMessagingConfig, c: ServerConfig) => !c.Environment.sendMailAvailable
      } as TAGS,
    description: $localize`Sendmail uses the built in unix binary if available. STMP connects to any STMP server of your choice.`
  })
  type: EmailMessagingType = EmailMessagingType.sendmail;

  @ConfigProperty({
    tags:
      {
        name: $localize`SMTP`,
        relevant: (c: any) => c.type === EmailMessagingType.SMTP,
      }
  })
  smtp?: EmailSMTPMessagingConfig = new EmailSMTPMessagingConfig();

}

@SubConfigClass<TAGS>({softReadonly: true})
export class MessagingConfig {
  @ConfigProperty({
    tags:
      {
        name: $localize`Email`,
      },
    description: $localize`The app uses Nodemailer in the background for sending e-mails. Refer to https://nodemailer.com/usage/ if some options are not clear.`
  })
  Email: EmailMessagingConfig = new EmailMessagingConfig();
}
