declare module "flat-file-db" {
    export function sync(path:string):DB;
}

declare interface DB {
    sync();
    put();
    get();
    del();
    has();
    keys();
    close();
}