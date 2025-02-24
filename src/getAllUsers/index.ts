import { string, number, object, InferType } from 'yup'
import DDBUser from '../../lib/DB/DDBUser'

export const ParamSchema = object({
  keyword: string().default(''),
  limit: number().default(10),
  nextKey: object().unknown().default(() => undefined),
})

export default async function getAllUsers(params: InferType<typeof ParamSchema>) {
  const { keyword, limit, nextKey, } = params
  const ddb = new DDBUser()
  const result = await ddb.searchByFullName({
    keyword,
    limit,
    nextKey,
  })

  return result
}
