import {User} from "../../../common/entities/User";
import {IUserManager} from "../IUserManager";
import {DatabaseManager} from "./DatabaseManager";

export class MongoUserManager implements IUserManager{

    private UserModel;

    constructor(){
        this.UserModel = DatabaseManager.getInstance().getModel('user',{
            name:String,
            email:{ type: String, index: { unique: true }},
            password:String,
            role:Number
        });
    }

    public findOne(filter,cb:(error: any,result:User) => void){
        return this.UserModel.findOne(filter,function (err, result) {
            return cb(err, result);
        }); 
    }

    public find(filter,cb:(error: any,result:Array<User>) => void){
        this.UserModel.find(filter,function (err, result) {
            return cb(err, result);
        });
    }

    public createUser(user,cb:(error: any,result:User) => void){        
        this.UserModel.create(user,cb);
    }

    public deleteUser(id:number,cb:(error: any) => void){
        this.UserModel.remove({id:id},cb);
    }
    
    public changeRole(request:any,cb:(error: any,result:string) => void){
        throw new Error("not implemented"); //TODO: implement
    }
    public changePassword(request:any,cb:(error: any,result:string) => void){
        throw new Error("not implemented"); //TODO: implement
    }

}