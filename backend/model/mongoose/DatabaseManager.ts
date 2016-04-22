import * as mongoose from 'mongoose';
import {Schema} from "mongoose";
export class DatabaseManager{
    private static _instance:DatabaseManager = null;
    private connectionError = false;

    constructor(onError?:(err)=>void){
        mongoose.connection.on('error', function (err) {
            this.connectionError = true;
            if(onError){
                onError(err);
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

    public static getInstance(onError?:(err)=>void){
        if(DatabaseManager._instance === null){
            DatabaseManager._instance = new DatabaseManager(onError);
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