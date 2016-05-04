import {DatabaseManager} from "../DatabaseManager";
export var UserModel = DatabaseManager.getInstance().getModel('user', {
    name: {type: String, index: {unique: true}},
    password: String,
    role: Number
});