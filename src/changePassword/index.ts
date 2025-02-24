import { v4 as uuidv4 } from 'uuid'
import { object, string, InferType } from 'yup'
import Encryptor from '../../lib/Encryption/Encryptor'
import Config from '../../lib/Constants/Config'
import DDBUser from '../../lib/DB/DDBUser'
import UserSchema from '../../lib/Schema/UserSchema'
import Salt from '../../lib/Encryption/Salt'
import ChangePasswordStream from '../../lib/Utils/ChangePasswordStream'
import TOTP from '../../lib/Utils/TOTPGenerator'

const totp = new TOTP()

export const ChangePasswordParamShape = object().shape({
  email: string().email().required(),
  currentPassword: string().required(),
  newPassword: string().required(),
}).noUnknown(true)

export default async function changePassword({ email, currentPassword, newPassword }: InferType<typeof ChangePasswordParamShape>) {
  const ddb = new DDBUser()
  const encryptor = new Encryptor()
  const response = await ddb.query({ email, projection: ['id', 'isActive', 'isLocked', 'salt', 'password', 'fullName', 'isNewUser', 'isPasswordReset'] })

  if (!currentPassword || !newPassword) {
    throw new Error('Invalid Password')
  }
  
  if (response.Count! > 1) {
    throw new Error('Unable to properly process the request')
  }
  
  const [user] = <InferType<typeof UserSchema>[]>response.Items!

  const [currPass, newPass] = await Promise.all([
    encryptor.decrypt(currentPassword),
    encryptor.decrypt(newPassword)
  ])

  if (currPass === newPass) {
    throw new Error('Invalid password') 
  }

  if (!user) {
    throw new Error('Unable to properly process the request. Check the user record.')
  }

  if (!user.isActive) {
    throw new Error('Unable to properly process the request. The user is deactivated') 
  }
  
  const { encVal } = new Salt(user.salt).hash(currPass)

  if (encVal !== user.password) {
    throw new Error('Invalid password') 
  }
  
  const { encVal: newPasswordHash, salt } = new Salt(uuidv4()).hash(newPass)

  const result = await ddb.newPassword({
    email,
    password: newPasswordHash,
    salt,
    isNewUser: false,
    isPasswordReset: false,
  })
  
  await (new ChangePasswordStream().putRecord({
    subject: 'Sendwell Utility - Change Password',
    templateName: 'ChangePassword',
    to: email,
    dynamicTemplateData: {
      fullName: user.fullName,
      supportEmail: Config.SENDWELL_SUPPORT_EMAIL,
    },
  }))

  return result
}
