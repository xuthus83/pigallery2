import {DatabaseManager} from "../DatabaseManager";
import {Schema} from "mongoose";


export var PhotoModel = DatabaseManager.getInstance().getModel('photo',{
    name:String,
    width:Number,
    height: Number,
    directory: {
        type: Schema.Types.ObjectId,
        ref: 'directory'
    },
});

 