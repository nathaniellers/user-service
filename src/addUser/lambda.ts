import Handler, { EventParam } from '../../lib/Lambda/Handler'
import UserSchema from '../../lib/Schema/UserSchema'
import Result from '../../lib/Response/Result'
import addUser from '.'

export const handler = Handler(async ({ event }: EventParam) => {
  const { body } = event
  const param = UserSchema.validateSync(body)!
  
  let result: any
  
  try {
    result = await addUser(param)
  } catch (e) {
    return new Result({
      success: false,
      message: e.message,
    })
  }

  return new Result({
    success: true,
    data: {
      id: param.id,
    },
  })
})
