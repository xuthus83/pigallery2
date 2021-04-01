export class Utils {
  static GUID() {
    const s4 = function () {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };

    return s4() + s4() + '-' + s4() + s4();
  }

  static chunkArrays<T>(arr: T[], chunkSize: number): T[][] {
    const R = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      R.push(arr.slice(i, i + chunkSize));
    }
    return R;
  }

  static wait(time: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }


  static removeNullOrEmptyObj<T extends any>(obj: T): T {
    if (typeof obj !== 'object' || obj == null) {
      return obj;
    }

    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (obj[key] !== null && typeof obj[key] === 'object') {
        if (Utils.removeNullOrEmptyObj(obj[key])) {
          if (Object.keys(obj[key]).length === 0) {
            delete obj[key];
          }
        }
      } else if (obj[key] === null) {
        delete obj[key];
      }
    }
    return obj;
  }

  static clone<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
  }

  static zeroPrefix(value: string | number, length: number) {
    const ret = '00000' + value;
    return ret.substr(ret.length - length);
  }

  /**
   * Checks if the two input (let them be objects or arrays or just primitives) are equal
   * @param object
   * @param filter
   */
  static equalsFilter(object: any, filter: any): boolean {
    if (typeof filter !== 'object' || filter == null) {
      return object === filter;
    }
    if (!object) {
      return false;
    }

    if (Array.isArray(object) && object.length !== filter.length) {
      return false;
    }
    const keys = Object.keys(filter);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (typeof filter[key] === 'object') {
        if (Utils.equalsFilter(object[key], filter[key]) === false) {
          return false;
        }
      } else if (object[key] !== filter[key]) {
        return false;

      }
    }

    return true;
  }

  static renderDataSize(size: number) {
    const postFixes = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;
    while (size > 1000 && index < postFixes.length - 1) {
      size /= 1000;
      index++;
    }
    return size.toFixed(2) + postFixes[index];
  }


  /**
   *
   * @param from
   * @param to inclusive
   * @returns {Array}
   */
  static createRange(from: number, to: number): Array<number> {
    const arr = new Array(to - from + 1);
    let c = to - from + 1;
    while (c--) {
      arr[c] = to--;
    }
    return arr;
  }

  public static canonizePath(path: string) {
    return path
      .replace(new RegExp('\\\\', 'g'), '/')
      .replace(new RegExp('/+', 'g'), '/');
  }

  static concatUrls(...args: Array<string>) {
    let url = '';
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '' || typeof args[i] === 'undefined') {
        continue;
      }

      const part = args[i].replace(new RegExp('\\\\', 'g'), '/');
      if (part === '/' || part === './') {
        continue;
      }

      url += part + '/';
    }
    url = url.replace(new RegExp('/+', 'g'), '/');

    if (url.trim() === '') {
      url = './';
    }

    return url.substring(0, url.length - 1);
  }

  public static updateKeys(targetObject: any, sourceObject: any) {
    Object.keys(sourceObject).forEach((key) => {
      if (typeof targetObject[key] === 'undefined') {
        return;
      }
      if (typeof targetObject[key] === 'object') {
        Utils.updateKeys(targetObject[key], sourceObject[key]);
      } else {
        targetObject[key] = sourceObject[key];
      }
    });
  }

  public static setKeys(targetObject: any, sourceObject: any) {
    Object.keys(sourceObject).forEach((key) => {
      if (typeof targetObject[key] === 'object') {
        Utils.setKeys(targetObject[key], sourceObject[key]);
      } else {
        targetObject[key] = sourceObject[key];
      }
    });
  }

  public static setKeysForced(targetObject: any, sourceObject: any) {
    Object.keys(sourceObject).forEach((key) => {
      if (typeof sourceObject[key] === 'object') {
        if (typeof targetObject[key] === 'undefined') {
          targetObject[key] = {};
        }
        Utils.setKeysForced(targetObject[key], sourceObject[key]);
      } else {
        targetObject[key] = sourceObject[key];
      }
    });
  }

  public static enumToArray(EnumType: any): { key: number; value: string }[] {
    const arr: Array<{ key: number; value: string; }> = [];
    for (const enumMember in EnumType) {
      if (!EnumType.hasOwnProperty(enumMember)) {
        continue;
      }
      const key = parseInt(enumMember, 10);
      if (key >= 0) {
        arr.push({key: key, value: EnumType[enumMember]});
      }
    }
    return arr;
  }


  public static findClosest(number: number, arr: number[]): number {

    let curr = arr[0];
    let diff = Math.abs(number - curr);

    arr.forEach((value) => {

      const newDiff = Math.abs(number - value);

      if (newDiff < diff) {
        diff = newDiff;
        curr = value;
      }

    });

    return curr;
  }


  public static findClosestinSorted(number: number, arr: number[]): number {

    let curr = arr[0];
    let diff = Math.abs(number - curr);
    for (let i = 0; i < arr.length; ++i) {

      const newDiff = Math.abs(number - arr[i]);
      if (newDiff > diff) {
        break;
      }
      diff = newDiff;
      curr = arr[i];
    }


    return curr;
  }

  public static isUInt32(value: number, max: number = 4294967295) {
    value = parseInt('' + value, 10);
    return !isNaN(value) && value >= 0 && value <= max;
  }

  public static isInt32(value: number) {
    value = parseFloat('' + value);
    return !isNaN(value) && value >= -2147483648 && value <= 2147483647;
  }

  public static isFloat32(value: number) {
    const E = Math.pow(10, 38);
    const nE = Math.pow(10, -38);
    return !isNaN(value) && ((value >= -3.402823466 * E && value <= -1.175494351 * nE) ||
      (value <= 3.402823466 * E && value >= 1.175494351 * nE));
  }

  public static getAnyX(num: number, arr: any[], start = 0): any[][] {
    if (num <= 0 || num > arr.length || start >= arr.length) {
      return [];
    }
    if (num <= 1) {
      return arr.slice(start).map(e => [e]);
    }
    if (num === arr.length - start) {
      return [arr.slice(start)];
    }
    const ret: any[][] = [];
    for (let i = start; i < arr.length; ++i) {
      Utils.getAnyX(num - 1, arr, i + 1).forEach(a => {
        a.push(arr[i]);
        ret.push(a);
      });
    }
    return ret;
  }

}
