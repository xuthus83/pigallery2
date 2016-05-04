import {DatabaseManager} from "../DatabaseManager";

export var PhotoModel = DatabaseManager.getInstance().getModel('photo',{
    name:String,
    width:Number,
    height:Number
});

