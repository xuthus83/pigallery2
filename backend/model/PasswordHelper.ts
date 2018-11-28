let bcrypt: any;
try {
  bcrypt = require('bcrypt');
} catch (err) {
  bcrypt = require('bcryptjs');
}

export class PasswordHelper {
  public static cryptPassword(password: string) {
    const salt = bcrypt.genSaltSync(9);
    return bcrypt.hashSync(password, salt);
  }

  public static comparePassword(password: string, encryptedPassword: string) {
    return bcrypt.compareSync(password, encryptedPassword);
  }
}
