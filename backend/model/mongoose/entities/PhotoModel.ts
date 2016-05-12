import {DatabaseManager} from "../DatabaseManager";
import {Schema} from "mongoose";


export var PhotoModel = DatabaseManager.getInstance().getModel('photo', {
    name: String, 
    directory: {
        type: Schema.Types.ObjectId,
        ref: 'directory'
    },
    metadata: {
        keywords: [String],
        cameraData: {
            ISO: Number,
            maker: String,
            fStop: Number,
            exposure: Number,
            focalLength: Number,
            lens: String
        },
        positionData: {
            GPSData: {
                latitude: Number,
                longitude: Number,
                altitude: Number
            },
            country: String,
            state: String,
            city: String
        },
        size: {
            width: Number,
            height: Number
        },
        creationDate: Date
    }
});

 