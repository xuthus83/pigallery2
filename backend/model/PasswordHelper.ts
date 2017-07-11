import * as bcrypt from "bcryptjs";

export class PasswordHelper {
  public static cryptPassword(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  public static comparePassword(password, encryptedPassword) {
    return bcrypt.compareSync(password, encryptedPassword);
  }
}
