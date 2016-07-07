export class Utils {


    static clone<T>(object:T):T {
        return JSON.parse(JSON.stringify(object));
    }

    static equalsFilter(object:any, filter:any):boolean {

        let keys = Object.keys(filter);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (object[key] !== filter[key]) {
                return false;
            }
        }

        return true;
    }


    static concatUrls(...args:Array<string>) {
        let url = "";
        for (let i = 0; i < args.length; i++) {
            if (args[i] === "" || typeof args[i] === "undefined") continue;

            let part = args[i].replace("\\", "/");
            if (part === "/" || part === "./") continue;

            url += part + "/";
        }
        url = url.replace("//", "/");

        return url.substring(0, url.length - 1);
    }

    public static updateKeys(targetObject, sourceObject) {
        Object.keys(sourceObject).forEach((key)=> {
            if (typeof targetObject[key] === "undefined") {
                return;
            }
            if (typeof targetObject[key] === "object") {
                Utils.updateKeys(targetObject[key], sourceObject[key]);
            } else {
                targetObject[key] = sourceObject[key];
            }
        });
    }

    public static setKeys(targetObject, sourceObject) {
        Object.keys(sourceObject).forEach((key)=> {
            if (typeof targetObject[key] === "object") {
                Utils.setKeys(targetObject[key], sourceObject[key]);
            } else {
                targetObject[key] = sourceObject[key];
            }
        });
    }

    public static setKeysForced(targetObject, sourceObject) {
        Object.keys(sourceObject).forEach((key)=> {
            if (typeof sourceObject[key] === "object") {
                if (typeof targetObject[key] === "undefined") {
                    targetObject[key] = {};
                }
                Utils.setKeysForced(targetObject[key], sourceObject[key]);
            } else {
                targetObject[key] = sourceObject[key];
            }
        });
    }

    public static enumToArray(EnumType):Array<{key:number;value:string;}> {
        let arr:Array<{key:number;value:string;}> = [];
        for (let enumMember in EnumType) {
            if (!EnumType.hasOwnProperty(enumMember)) {
                continue;
            }
            let key = parseInt(enumMember, 10);
            if (key >= 0) {
                arr.push({key: key, value: EnumType[enumMember]});
            }
        }
        return arr;
    }


    public static findClosest(number:number, arr:Array<number>) {

        let curr = arr[0];
        let diff = Math.abs(number - curr);

        arr.forEach((value)=> {

            let newDiff = Math.abs(number - value);

            if (newDiff < diff) {
                diff = newDiff;
                curr = value;
            }

        });

        return curr;
    }

}
