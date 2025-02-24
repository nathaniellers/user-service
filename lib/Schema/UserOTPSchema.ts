
import { string, date, boolean, object, number } from 'yup'
import { v4 as uuidv4 } from 'uuid'

function getOtpExpiration(minutes: number) {
  return () => {
    const currentDate = new Date()
    const futureDate = new Date(currentDate.getTime() + minutes * 60000)

    return String(futureDate)
  }
}

export const UserOTPSchema = object()
  .shape({
    id: string().uuid().default(() => uuidv4()),
    dataset: string().required().default(() => 'user-otp'),
    sort: string(),
    userPrimaryKey: object().shape({
      dataset: string().required().default(() => 'user'),
      sort: string().required().email(),
    }),
    email: string().required().email(),
    purpose: string().required().oneOf(['FORGOT_PASSWORD','ResendOTP','NEW_PASSWORD']),
    otp: string().required().min(4).max(6),
    isVerified: boolean().required().default(() => false),
    expirationDate: string().default(getOtpExpiration(15)),
    createdAt: string().default(() => String(new Date())),
    updatedAt: string().default(() => String(new Date())),
  })
  .noUnknown(true)

export default UserOTPSchema
