import * as bcrypt from "bcrypt";

export class PasswordHelper {
  public static async cryptPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  public static async comparePassword(password, encryptedPassword) {
    return bcrypt.compare(password, encryptedPassword);
  }
}
