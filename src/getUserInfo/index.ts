import { string, object, InferType } from 'yup'
import DDBUser from '../../lib/DB/DDBUser'

export const ParamSchema = object().shape({
  email: string().email().required()
}).noUnknown(true)

export default async function getUserInfo(params: InferType<typeof ParamSchema>) {
  const { email } = params
  const ddb = new DDBUser()
  const [user] = (await ddb.query({
    email,
  })).Items!

  return user
}
