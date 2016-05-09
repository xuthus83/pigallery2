export class Utils {

    static clone<T>(object:T):T {
        return JSON.parse(JSON.stringify(object));
    }


    static concatUrls(...args:Array<string>) {
        let url = "";
        for (let i = 0; i < args.length; i++) {
            if (args[i] === "" || typeof args[i] === "undefined") continue;

            let part = args[i].replace("\\", "/");
            if (part === "/" || part === "./") continue;

            url += part + "/";
        }

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
                Utils.updateKeys(targetObject[key], sourceObject[key]);
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

}
