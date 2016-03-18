import {User} from "../../common/entities/User";
export class UserManager {

    private static  DummyUser = new User("TestUser","test@test.hu","122345");

    public static findOne(filter,cb:(error: any,result:User) => void){
        return cb(null, UserManager.DummyUser);
    }

}