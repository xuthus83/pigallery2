import * as bcryptjs from "bcryptjs";

export class PasswordHelper {
  public static cryptPassword(password) {
    const salt = bcryptjs.genSaltSync(10);
    return bcryptjs.hashSync(password, salt);
  }

  public static comparePassword(password, encryptedPassword) {
    return bcryptjs.compareSync(password, encryptedPassword);
  }
}
