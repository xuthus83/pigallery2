import {propertyTypes} from 'typeconfig/common';

/**
 * Configuration in these class have a custom UI
 */
export class CustomSettingsEntries {
  public static readonly entries = ['ClientSortingConfig', 'ClientGroupingConfig', 'SVGIconConfig'];

  public static getConfigName(s: { tags?: { uiType?: string }, type?: propertyTypes, arrayType?: propertyTypes }): string {
    let c = s.tags?.uiType;
    try {
      if (!c) {
        if (s.arrayType) {
          c = Object.getPrototypeOf(Object.getPrototypeOf(s?.arrayType))?.name;
        } else {
          c = Object.getPrototypeOf(Object.getPrototypeOf(s?.type))?.name;
        }
      }
    } catch (e) {
      // no action
    }
    return c;
  }

  public static getFullName(s: { tags?: { uiType?: string }, type?: propertyTypes, arrayType?: propertyTypes }): string {
    const cN = this.getConfigName(s);
    if (!s.tags?.uiType && s.arrayType) {
      return cN + '-Array';
    }
    return cN;
  }

  public static iS(s: { tags?: { uiType?: string }, type?: propertyTypes }) {
    const c = this.getConfigName(s);
    return this.entries.includes(c);
  }
}

