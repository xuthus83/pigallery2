import {Messenger} from './Messenger';
import {EmailMessenger} from './EmailMessenger';
import {StdoutMessenger} from './StdoutMessenger';

export class MessengerRepository {

  private static instance: MessengerRepository = null;
  messengers: { [key: string]: Messenger } = {};

  public static get Instance(): MessengerRepository {
    if (MessengerRepository.instance == null) {
      MessengerRepository.instance = new MessengerRepository();
    }
    return MessengerRepository.instance;
  }

  getAll(): Messenger[] {
    return Object.values(this.messengers);
  }

  register(msgr: Messenger): void {
    if (typeof this.messengers[msgr.Name] !== 'undefined') {
      throw new Error('Messenger already exist:' + msgr.Name);
    }
    this.messengers[msgr.Name] = msgr;
  }

  get(name: string): Messenger {
    return this.messengers[name];
  }
}

MessengerRepository.Instance.register(new EmailMessenger());
MessengerRepository.Instance.register(new StdoutMessenger());
