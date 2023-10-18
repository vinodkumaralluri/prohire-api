import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
// import { Permission } from '../enums/permission.enum';

export class AppUtils {
  static DEFAULT_PAGE_LIMIT = 10;

  static async getEncryptedPassword(password: string) {
    return bcrypt.hash(password, 10);
  }
  static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000);
  }
  static getExpiryDate() {
    return new Date(moment.utc().add(10, 'minutes').format()).toISOString();
  }

  static getUtcMoment(dateInput = '') {
    return dateInput ? moment.utc(dateInput) : moment.utc();
  }

  static getIsoUtcMoment(dateInput = '') {
    const cMoment = dateInput ? moment.utc(dateInput) : moment.utc();
    return cMoment.format();
  }

}
