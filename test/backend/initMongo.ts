
import {MongoUserManager} from "../../backend/model/mongoose/MongoUserManager";
import {User, UserRoles} from "../../common/entities/User";
import {DatabaseManager} from "../../backend/model/mongoose/DatabaseManager";

DatabaseManager.getInstance((err)=>{
    DatabaseManager.getInstance().disconnect();
    process.exit()
},()=>{
    let userManager  = new MongoUserManager(); 
    userManager.createUser(new User(0,"demo","demo",UserRoles.Developer),(err)=>{
        DatabaseManager.getInstance().disconnect();
        process.exit()
    });

    userManager.createUser(new User(1,"developer","developer",UserRoles.Developer),(err)=>{
        DatabaseManager.getInstance().disconnect();
        process.exit()
    });

    userManager.createUser(new User(2,"admin","admin",UserRoles.Admin),(err)=>{
        DatabaseManager.getInstance().disconnect();
        process.exit()
    });

    userManager.createUser(new User(3,"user","user",UserRoles.User),(err)=>{
        DatabaseManager.getInstance().disconnect();
        process.exit()
    });

    userManager.createUser(new User(4,"guest","guest",UserRoles.Guest),(err)=>{
        DatabaseManager.getInstance().disconnect();
        process.exit()
    });
});