/// <reference path="../typings/tsd.d.ts"/>

export class Utils {

    static clone<T>(object:T):T {
        return JSON.parse(JSON.stringify(object));
    }


}
