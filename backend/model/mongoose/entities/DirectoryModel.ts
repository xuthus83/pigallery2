import {DatabaseManager} from "../DatabaseManager";
import {Schema} from "mongoose";

export var DirectoryModel = DatabaseManager.getInstance().getModel('directory', {
    name: String,
    path: String,
    lastUpdate: Date,
    directories: [{
        type: Schema.Types.ObjectId,
        ref: 'directory'
    }],
    photos: [{
        type: Schema.Types.ObjectId,
        ref: 'photo'
    }]
});