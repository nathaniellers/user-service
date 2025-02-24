import { v4 as uuidv4 } from 'uuid'
import { InferType, object, string, } from 'yup'
import DDBUser from '../../lib/DB/DDBUser'
import Salt from '../../lib/Encryption/Salt'
import UserSchema from '../../lib/Schema/UserSchema'
import Encryptor from '../../lib/Encryption/Encryptor'

const encryptor = new Encryptor()

export const VerifyForgotPWParamShape = object().shape({
  email: string().required().email(),
  otp: string().required(),
  newPassword: string().required(),
  confirmNewPassword: string().required(),
}).noUnknown(true)

export default async function verifyForgotPassword(param: InferType<typeof VerifyForgotPWParamShape>) {
  const { email, newPassword, confirmNewPassword } = param
  const ddb = new DDBUser()
  const response = await ddb.query({ email, projection: ['id', 'isActive', 'isLocked', 'salt', 'password', 'fullName', 'isNewUser', 'isPasswordReset'] })

  if (response.Count! > 1) {
    throw new Error('Unable to properly process the request')
  }

  const [user] = <InferType<typeof UserSchema>[]>response.Items!

  const [newPass, confirmNewPass] = await Promise.all([
    encryptor.decrypt(newPassword),
    encryptor.decrypt(confirmNewPassword),
  ])

  if (newPass !== confirmNewPass) {
    throw new Error('Invalid password')
  }

  if (!user) {
    throw new Error('Unable to properly process the request. Check the user record.')
  }

  if (!user.isActive) {
    throw new Error('Unable to properly process the request. Check the user status.') 
  }

  const { encVal: newPasswordHash, salt } = new Salt(uuidv4()).hash(newPass)

  const result = await ddb.newPassword({
    email: email,
    password: newPasswordHash,
    salt,
    isNewUser: false,
    isPasswordReset: false
  })

  return result
}
