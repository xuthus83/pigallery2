import {propertyTypes} from 'typeconfig/common';

export class CustomSettingsEntries {
  public static readonly entries = ['ClientSortingConfig', 'ClientGroupingConfig', 'SVGIconConfig'];

  static getName(s: { tags?: { uiType?: string }, type?: propertyTypes }): string {
    let c = s.tags?.uiType;
    try {
      if (!c) {
        c = Object.getPrototypeOf(Object.getPrototypeOf(s?.type))?.name;
      }
    } catch (e) {
      // no action
    }
    return c;
  }

  public static iS(s: { tags?: { uiType?: string }, type?: propertyTypes }) {
    const c = this.getName(s);
    return this.entries.includes(c);
  }
}

