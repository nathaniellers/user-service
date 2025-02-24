import { object, string, InferType } from 'yup'
import DDBUser from '../../lib/DB/DDBUser'

export const ReactivateUserParamShape = object().shape({
  email: string().email().required(),
}).noUnknown(true)

export default async function reactivateUser({ email }: InferType<typeof ReactivateUserParamShape>) {
  const ddb = new DDBUser()
  const result = await ddb.reactivate({ email })

  return result
}
