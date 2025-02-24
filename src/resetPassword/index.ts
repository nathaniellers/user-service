import { v4 as uuidv4 } from 'uuid'
import { object, string, InferType } from 'yup'
import Encryptor from '../../lib/Encryption/Encryptor'
import Config from '../../lib/Constants/Config'
import DDBUser from '../../lib/DB/DDBUser'
import UserSchema from '../../lib/Schema/UserSchema'
import Salt from '../../lib/Encryption/Salt'
import ChangePasswordStream from '../../lib/Utils/ChangePasswordStream'

export const ChangePasswordParamShape = object().shape({
  email: string().email().required(),
  password: string().required(),
}).noUnknown(true)

export default async function resetPassword({ email, password }: InferType<typeof ChangePasswordParamShape>) {
  const ddb = new DDBUser()
  const encryptor = new Encryptor()
  const response = await ddb.query({ email, projection: ['id', 'isActive', 'isLocked', 'salt', 'password', 'fullName'] })

  if (response.Count! > 1) {
    throw new Error('Unable to properly process the request')
  }

  const [user] = <InferType<typeof UserSchema>[]>response.Items!

  if (!user) {
    throw new Error('Unable to properly process the request. Check the user record.')
  }

  if (!user.isActive) {
    throw new Error('Unable to properly process the request. Check the user status.') 
  }
  
  const pw = await encryptor.decrypt(password)
  const { encVal: newPasswordHash, salt } = new Salt(uuidv4()).hash(pw)

  const result = await ddb.resetPassword({
    email,
    password: newPasswordHash,
    salt,
  })

  await (new ChangePasswordStream().putRecord({
    subject: 'Sendwell Utility - Reset Password',
    templateName: 'ChangePassword',
    to: email,
    dynamicTemplateData: {
      fullName: user.fullName,
      supportEmail: Config.SENDWELL_SUPPORT_EMAIL,
    },
  }))

  return result
}
