import { v4 as uuidv4 } from 'uuid'
import { InferType } from 'yup'
import Encryptor from '../../lib/Encryption/Encryptor'
import Config from '../../lib/Constants/Config'
import DDBUser from '../../lib/DB/DDBUser'
import UserSchema from '../../lib/Schema/UserSchema'
import Salt from '../../lib/Encryption/Salt'
import AddNewUserStream from '../../lib/Utils/AddNewUserStream'

export default async function addUser(user: InferType<typeof UserSchema>) {
  const ddb = new DDBUser()
  const encryptor = new Encryptor()

  user.password = await encryptor.decrypt(user.password)

  const { encVal, salt } = new Salt(uuidv4()).hash(user.password!)
  const encryptedUserPayload = <InferType<typeof UserSchema>>{
    ...user,
    salt,
    password: encVal,
    isNewUser: true,
  }
  
  await ddb.add(encryptedUserPayload)

  const { Items } = await ddb.query({
    email: user.email
  })

  const userRecord = <InferType<typeof UserSchema>>Items![0]

  const response = await (new AddNewUserStream().putRecord({
    to: userRecord.email,
    subject: 'Sendwell Utility - User Registration',
    templateName: 'UserRegistration',
    dynamicTemplateData: {
      fullName: userRecord.fullName,
      supportEmail: Config.SENDWELL_SUPPORT_EMAIL,
    },
  }))
  
  return response
}
