import { object, string, InferType } from 'yup'
import DDBUser from '../../lib/DB/DDBUser'

export const DeactivateUserParamShape = object().shape({
  email: string().email().required(),
}).noUnknown(true)

export default async function deactivateUser({ email }: InferType<typeof DeactivateUserParamShape>) {
  const ddb = new DDBUser()
  const response = await ddb.query({ email })
  if (response.Count! < 1) {
    throw new Error('Unable to properly process the request')
  }
  
  if (!response.Items![0].isActive) {
    throw new Error('Unable to properly process the request')
  }

  const result = await ddb.deactivate({ email })

  return result
}
