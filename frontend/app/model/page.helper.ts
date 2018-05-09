export class PageHelper {
  private static readonly supportPageOffset = window.pageXOffset !== undefined;
  private static readonly isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

  constructor() {

  }

  public static get ScrollY(): number {
    return this.supportPageOffset ? window.pageYOffset : this.isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
  }

  public static showScrollY() {
    document.getElementsByTagName('body')[0].style.overflowY = 'scroll';
  }

  public static isScrollYVisible(): boolean {
    return document.getElementsByTagName('body')[0].style.overflowY === 'scroll';
  }

  public static hideScrollY() {
    document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
  }
}
