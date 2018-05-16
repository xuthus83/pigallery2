export class PageHelper {
  private static readonly supportPageOffset = window.pageXOffset !== undefined;
  private static readonly isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');
  private static readonly body = document.getElementsByTagName('body')[0];

  constructor() {

  }

  public static get ScrollY(): number {
    return this.supportPageOffset ? window.pageYOffset : this.isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
  }

  public static showScrollY() {
    PageHelper.body.style.overflowY = 'scroll';
  }

  public static isScrollYVisible(): boolean {
    return PageHelper.body.style.overflowY === 'scroll';
  }

  public static hideScrollY() {
    PageHelper.body.style.overflowY = 'hidden';
  }
}
