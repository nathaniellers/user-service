
import { v4 as uuidv4 } from 'uuid'
import { InferType } from 'yup'
import UserOTPSchema from '../../Schema/UserOTPSchema'
import DDBUserOTP from '../DDBUserOTP'
import OTPGenerator from '../../Utils/OTPGenerator'

describe('DDBUserOTP', () => {

  const tableName = 'user-service'
  const ddb = new DDBUserOTP({
    tableName,
  })
  const otp = OTPGenerator.generateOtp()

  it('should be able to add OTP', async () => {

    const userOTP = UserOTPSchema.validateSync({
      userPrimaryKey: {
        dataset: 'user',
        sort: 'test_email2@example.com',
      },
      otp,
    })

    try {
      const result = await ddb.add(userOTP)
      expect(result).toStrictEqual({})
    } catch (e) {
      throw e
    }
  })

  it('should be able to get the OTP information', async () => {
    try {
      const result = await ddb.query({ otp })

      expect(result).toBeTruthy()
    } catch (e) {
      throw e
    }
  })

  it('should be able verify OTP', async () => {
    try {
      const result = await ddb.verifyOtp({ otp })
      expect(result).toBeTruthy()
      expect(result.Attributes.isVerified).toBe(true)
    } catch (e) {
      throw e
    }
  })
})