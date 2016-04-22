
import {MongoUserManager} from "../../backend/model/mongoose/MongoUserManager";
import {User, UserRoles} from "../../common/entities/User";
import {DatabaseManager} from "../../backend/model/mongoose/DatabaseManager";
let userManager  = new MongoUserManager(); 
userManager.createUser(new User(0,"demo","demo@demo.hu","demo",UserRoles.Developer),(err)=>{
    DatabaseManager.getInstance().disconnect();
});