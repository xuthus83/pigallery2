///<reference path="../../../typings/main.d.ts"/>

import * as mongoose from 'mongoose';
import {Schema} from "mongoose";
export class DatabaseManager{
    private static _instance:DatabaseManager = null;
    private connectionError = false;

    constructor(onError?:(err)=>void,onConnected?:() =>void){
        mongoose.connection.on('error', function (err) {
            this.connectionError = true;
            if(onError){
                onError(err);
            }
        });
        mongoose.connection.on('connected', function () {
            if(onConnected){
                onConnected();
            }
        });
        try {
            mongoose.connect('mongodb://localhost/EQZT6L');
        }catch(ex){
            this.connectionError = true;
            if(onError){
                onError(ex);
            }
        }
    }

    public static getInstance(onError?:(err)=>void,onConnected?:() =>void){
        if(DatabaseManager._instance === null){
            DatabaseManager._instance = new DatabaseManager(onError,onConnected);
        }else{
            if(DatabaseManager._instance.connectionError === false && onConnected){
                onConnected();
            }
        }
        return DatabaseManager._instance;
    }

    public getModel(name:string,schema:any){
        return mongoose.model(name,new Schema(schema));
    }
    
    public disconnect(){
        mongoose.disconnect();
    }
    
    public isConnectionError(){
        return this.connectionError;
    }
}