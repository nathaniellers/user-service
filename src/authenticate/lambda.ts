import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'

import authenticate, { ParamSchema } from '.'
import StatusCode from '../../lib/Http/StatusCode'

export const handler = Handler(async ({ event }: EventParam) => {
  const { body } = event
  const param = ParamSchema.validateSync(body)!
  
  let result: any
  
  try {
    result = await authenticate(param)
  } catch (e) {
    return new Result({
      statusCode: StatusCode.BadRequest,
      success: false,
      message: e.message,
    })
  }

  return new Result({
    statusCode: StatusCode.OK,
    success: true,
    data: result,
  })
})

