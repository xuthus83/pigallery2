import {MongoUserManager} from "../../backend/model/mongoose/MongoUserManager";
import {User, UserRoles} from "../../common/entities/User";
import {DatabaseManager} from "../../backend/model/mongoose/DatabaseManager";


DatabaseManager.getInstance().onConnectionError(()=> {
    DatabaseManager.getInstance().disconnect();
    process.exit()
});

DatabaseManager.getInstance().onConnected(()=> {
    let userManager = new MongoUserManager();
    userManager.createUser(new User(0, "demo", "demo", UserRoles.Developer), (err)=> {

        userManager.createUser(new User(1, "developer", "developer", UserRoles.Developer), (err)=> {

            userManager.createUser(new User(2, "admin", "admin", UserRoles.Admin), (err)=> {

                userManager.createUser(new User(3, "user", "user", UserRoles.User), (err)=> {

                    userManager.createUser(new User(4, "guest", "guest", UserRoles.Guest), (err)=> {

                        DatabaseManager.getInstance().disconnect();
                        process.exit()
                    });
                });
            });
        });
    });


});