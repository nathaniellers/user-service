import { v4 as uuidv4 } from 'uuid'

export default class OTPGenerator {

  public static generateOtp() {
    const id = uuidv4()
    const otp = id.replace(/-/g, '').substring(0, 6).toUpperCase()
    return otp
  }

}