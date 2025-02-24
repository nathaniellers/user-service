import { InferType } from 'yup'
import OTPGenerator from '../../lib/Utils/OTPGenerator'
import Config from '../../lib/Constants/Config'
import DDBUser from '../../lib/DB/DDBUser'
import DDBUserOTP from '../../lib/DB/DDBUserOTP'
import UserSchema from '../../lib/Schema/UserSchema'
import UserOTPSchema from '../../lib/Schema/UserOTPSchema'
import ForgotPasswordStream from '../../lib/Utils/ForgotPasswordStream'

type ForgotPasswordParam = {
  email: string,
}

export default async function forgotPassword(param: ForgotPasswordParam) {
  const ddbUser = new DDBUser()
  const { email } = param
  const { Count, Items } = await ddbUser.query(param)
  if (Count !== 1) {
    throw new Error('User does not exist')
  }

  if (!Items![0].isActive) {
    throw new Error('Unable to properly process the requests')
  }

  const userRecord = <InferType<typeof UserSchema>>Items![0]
  const ddbUserOTP = new DDBUserOTP()
  const otp = OTPGenerator.generateOtp()

  console.log(`[User][Record]${JSON.stringify(userRecord)}`)
  

  // register otp to the database
  await ddbUserOTP.add(UserOTPSchema.validateSync({
    otp,
    userPrimaryKey: {
      dataset: userRecord.dataset,
      sort: userRecord.sort,
    },
    id: userRecord.id,
    email,
    purpose: 'FORGOT_PASSWORD',
  }))

  // push the otp to the data stream
  const _param = {
    to: userRecord.email,
    subject: 'Forgot Password',
    templateName: 'ForgotPassword',
    dynamicTemplateData: {
      fullName: userRecord.fullName,
      otp,
      expireMinutes: Config.OTP_EXPIRATION_MINUTES,
      devEmail: Config.SENDWELL_SUPPORT_EMAIL,
    }
  }
  
  const response = await (new ForgotPasswordStream().putRecord(_param))

  return response
}
