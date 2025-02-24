import { InferType } from 'yup'
import DDBUser from '../../lib/DB/DDBUser'
import UserSchema from '../../lib/Schema/UserSchema'

export default async function updateUser(user: InferType<typeof UserSchema>) {
  const ddb = new DDBUser()
  const email = user.email
  
  if (!user.email) {
    throw new Error('Error')
  }
  
  const [checkUserExist] = (await ddb.query({email})).Items!
  
  if (checkUserExist.Count! < 1) {
    throw new Error('No User')
  }
  
  const result = await ddb.update(user)

  return result
}
