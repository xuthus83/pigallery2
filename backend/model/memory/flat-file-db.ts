declare module "flat-file-db" {
    export function sync(path: string): DB;
}

declare interface DB {
    sync(): any;
    put(): any;
    get(): any;
    del(): any;
    has(): any;
    keys(): any;
    close(): any;
}