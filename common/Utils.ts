/// <reference path="../typings/main.d.ts"/>

export class Utils {

    static clone<T>(object:T):T {
        return JSON.parse(JSON.stringify(object));
    }


}
