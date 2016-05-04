///<reference path="../../../typings/main.d.ts"/>

import * as mongoose from "mongoose";
import {Schema} from "mongoose";

export class DatabaseManager {
    private static _instance:DatabaseManager = null;
    private connectionError = false;
    private errorObject = null;
    private connectionOpen = false;

    constructor() {
        mongoose.connect('mongodb://localhost/EQZT6L');
    }

    public static getInstance(onError?:(err)=>void, onConnected?:() =>void) { 
        if (DatabaseManager._instance === null) {
            DatabaseManager._instance = new DatabaseManager();
        }  
        return DatabaseManager._instance;
    }

    public onConnectionError(onError:(err) => void){
        if (this.connectionError === true) {
           return onError(DatabaseManager._instance.errorObject);
        }
        mongoose.connection.once('error', (err) => {
            this.connectionError = true;
            this.errorObject = err;
            onError(err); 
        });
    }

    public onConnected(onConnected:() => void){
        if (this.connectionOpen === true) {
            return onConnected();
        }
        mongoose.connection.once('open', (err) => {
            this.connectionOpen = true;
            onConnected();
        });
    }
    
    public getModel(name:string, schema:any) {
        return mongoose.model(name, new Schema(schema));
    }

    public disconnect() {
        mongoose.disconnect();
    }

    public isConnectionError() {
        return this.connectionError;
    }
}