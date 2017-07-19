let bcrypt;
try {
  bcrypt = require("bcrypt");
} catch (err) {
  bcrypt = require("bcryptjs");
}

export class PasswordHelper {
  public static cryptPassword(password) {
    const salt = bcrypt.genSaltSync(9);
    return bcrypt.hashSync(password, salt);
  }

  public static comparePassword(password, encryptedPassword) {
    return bcrypt.compareSync(password, encryptedPassword);
  }
}
