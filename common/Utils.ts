export class Utils {


  static clone<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
  }

  static equalsFilter(object: any, filter: any): boolean {
    if (typeof filter !== 'object' || filter == null) {
      return object === filter;
    }
    if (!object) {
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

  static concatUrls(...args: Array<string>) {
    let url = '';
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '' || typeof args[i] === 'undefined') {
        continue;
      }

      const part = args[i].replace('\\', '/');
      if (part === '/' || part === './') {
        continue;
      }

      url += part + '/';
    }
    url = url.replace('//', '/');

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

  public static enumToArray(EnumType: any): Array<{
    key: number;
    value: string;
  }> {
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


  public static findClosest(number: number, arr: Array<number>) {

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

}
