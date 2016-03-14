///<reference path="../../typings/main.d.ts"/>

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

export class Event<T> {
    private handlers: { (data?: T): void; }[] = [];

    public on(handler: { (data?: T): void }) {
        if(!isFunction(handler)){
            throw new Error("Handler is not a function");
        }
        this.handlers.push(handler);
    }

    public off(handler: { (data?: T): void }) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public allOff() {
        this.handlers = [];
    }

    public trigger(data?: T) {
        if (this.handlers) {
            this.handlers.slice(0).forEach(h => h(data));
        }
    }
}

