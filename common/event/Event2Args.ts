export class Event2Args<T, M> {
  private handlers: { (data?: T, data2?: M): void; }[] = [];

  public on(handler: { (data?: T, data2?: M): void }) {
    this.handlers.push(handler);
  }

  public off(handler: { (data?: T, data2?: M): void }) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  public allOff() {
    this.handlers = [];
  }

  public trigger(data?: T, data2?: M) {
    if (this.handlers) {
      this.handlers.slice(0).forEach(h => h(data, data2));
    }
  }
}
