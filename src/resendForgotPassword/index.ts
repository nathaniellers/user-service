import { boolean, InferType, object, string } from 'yup'
import DDBUser from '../../lib/DB/DDBUser'
import UserSchema from '../../lib/Schema/UserSchema'
import DDBUserOTP from '../../lib/DB/DDBUserOTP'
import OTPGenerator from '../../lib/Utils/OTPGenerator'
import UserOTPSchema from '../../lib/Schema/UserOTPSchema'
import ResendForgotPasswordStream from '../../lib/Utils/ResendForgotPasswordStream'
import Config from '../../lib/Constants/Config'

type ForgotPasswordParam = {
  email: string,
  subject?: string
}

export const isEmailVerifiedUpdateParam = object().shape({
  email: string().email().required(),
  isEmailVerified: boolean().required()
})

export default async function resendForgotPassword(param: ForgotPasswordParam) {
  const { email, subject } = param

  const ddbUser = new DDBUser()
  const { Count, Items } = await ddbUser.query({ email })

  if (Count !== 1) {
    throw new Error('User doest not exist')
  }

  const userRecord = <InferType<typeof UserSchema>>Items![0]
  const ddbUserOTP = new DDBUserOTP
  const otp = OTPGenerator.generateOtp()

  // register otp to the database
  await ddbUserOTP.add(UserOTPSchema.validateSync({
    otp,
    userPrimaryKey: {
      dataset: userRecord.dataset,
      sort: userRecord.sort
    },
    purpose: 'ResendOTP',
    email
  }))

  // push the otp to the data stream
  const response = await (new ResendForgotPasswordStream().putRecord({
    to: userRecord.email,
    subject: subject ? subject : 'Resend Forgot Password',
    templateName: 'ResendOTP',
    dynamicTemplateData: {
      fullName: userRecord.fullName,
      otp,
      expireMinutes: Config.OTP_EXPIRATION_MINUTES,
      devEmail: Config.SENDWELL_SUPPORT_EMAIL,
    }
  }))

  return response
}
